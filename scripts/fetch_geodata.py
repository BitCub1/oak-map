#!/usr/bin/env python3
"""
fetch_geodata.py - Fetch all GeoJSON data for the OAK Bay Area interactive map.

Uses ONLY Python stdlib (urllib.request, json, os, sys, time).
Sources:
  - Census TIGERweb REST API -> city & county boundaries
  - Overpass API             -> BART routes/stations, highways, OAK airport
"""

import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error
import io

# Force UTF-8 output on Windows to avoid charmap encoding errors
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DELAY = 2  # seconds between API calls

# Bay Area cities grouped by county
COUNTY_CITIES = {
    "Alameda": [
        "Oakland", "Fremont", "Hayward", "Berkeley", "San Leandro",
        "Livermore", "Alameda", "Pleasanton", "Dublin", "Newark",
        "Union City", "Albany", "Emeryville", "Piedmont",
    ],
    "Contra Costa": [
        "Concord", "Antioch", "Richmond", "San Ramon", "Pittsburg",
        "Walnut Creek", "Brentwood", "Oakley", "Danville", "Martinez",
        "Pleasant Hill", "San Pablo", "Hercules", "El Cerrito",
        "Lafayette", "Orinda", "Pinole", "Moraga", "Clayton",
    ],
    "San Francisco": ["San Francisco"],
    "San Mateo": [
        "San Mateo", "Daly City", "Redwood City", "South San Francisco",
        "San Bruno", "Pacifica", "Foster City", "Menlo Park", "Burlingame",
        "San Carlos", "East Palo Alto", "Belmont", "Millbrae",
        "Half Moon Bay", "Hillsborough", "Atherton", "Woodside",
        "Brisbane", "Portola Valley", "Colma",
    ],
    "Santa Clara": [
        "San Jose", "Sunnyvale", "Santa Clara", "Mountain View", "Milpitas",
        "Palo Alto", "Gilroy", "Cupertino", "Morgan Hill", "Campbell",
        "Los Gatos", "Los Altos", "Saratoga", "Los Altos Hills",
        "Monte Sereno",
    ],
    "Marin": [
        "San Rafael", "Novato", "Mill Valley", "Larkspur", "San Anselmo",
        "Corte Madera", "Tiburon", "Fairfax", "Sausalito", "Ross",
        "Belvedere",
    ],
    "Napa": ["Napa", "American Canyon", "St. Helena", "Calistoga", "Yountville"],
    "Solano": [
        "Vallejo", "Fairfield", "Vacaville", "Suisun City", "Benicia",
        "Dixon", "Rio Vista",
    ],
    "Sonoma": [
        "Santa Rosa", "Petaluma", "Rohnert Park", "Windsor",
        "Healdsburg", "Sonoma", "Cloverdale", "Sebastopol", "Cotati",
    ],
}

# Reverse lookup: city name -> county
CITY_TO_COUNTY = {}
for county, cities in COUNTY_CITIES.items():
    for city in cities:
        CITY_TO_COUNTY[city] = county

ALLOWED_CITIES = set(CITY_TO_COUNTY.keys())

# FIPS county codes for the 9 Bay Area counties (California = 06)
BAY_AREA_COUNTY_FIPS = "'001','013','041','055','075','081','085','095','097'"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def ensure_data_dir():
    """Create the data/ directory if it doesn't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"[OK] Data directory ready: {DATA_DIR}")


def fetch_url(url, timeout=120):
    """Fetch a URL and return the decoded text. Raises on HTTP errors."""
    req = urllib.request.Request(url, headers={"User-Agent": "OAK-BayArea-Map/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8")


def save_geojson(data, filename):
    """Write a GeoJSON dict to *filename* inside DATA_DIR."""
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    size_kb = os.path.getsize(path) / 1024
    print(f"   -> Saved {filename}  ({size_kb:,.1f} KB, {len(data.get('features', []))} features)")
    return path


def polite_pause():
    """Sleep between API calls to be polite."""
    time.sleep(DELAY)


# ---------------------------------------------------------------------------
# A. City Boundaries
# ---------------------------------------------------------------------------


def fetch_cities():
    """Fetch California incorporated-place boundaries and filter to Bay Area."""
    print("\n[1/6] Fetching city boundaries from Census TIGERweb...")
    base = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/28/query"
    params = urllib.parse.urlencode({
        "where": "STATE='06'",
        "outFields": "NAME,GEOID,BASENAME,AREALAND,AREAWATER",
        "outSR": "4326",
        "f": "geojson",
        "resultRecordCount": "2000",
    })
    url = f"{base}?{params}"

    raw = fetch_url(url, timeout=180)
    geojson = json.loads(raw)

    if "features" not in geojson:
        raise RuntimeError(f"Unexpected response (no 'features' key). Keys: {list(geojson.keys())}")

    total = len(geojson["features"])
    print(f"   Received {total} California places")

    # Build lookup: normalize names for matching
    # Census NAME field may be e.g. "Oakland city" or "Los Altos Hills town"
    # We need to match against our clean city names
    allowed_lower = {c.lower(): c for c in ALLOWED_CITIES}

    def match_city_name(census_name):
        """Try to match a Census NAME to one of our allowed city names."""
        cn = census_name.strip()
        # Direct match
        if cn in ALLOWED_CITIES:
            return cn
        # Try lowercase match
        cl = cn.lower()
        if cl in allowed_lower:
            return allowed_lower[cl]
        # Strip common suffixes: " city", " town", " CDP"
        for suffix in [" city", " town", " CDP", " village", " borough"]:
            if cl.endswith(suffix):
                stripped = cl[:-len(suffix)]
                if stripped in allowed_lower:
                    return allowed_lower[stripped]
        return None

    # Also try BASENAME field if available
    filtered = []
    for feat in geojson["features"]:
        props = feat.get("properties", {})
        name = props.get("NAME", "")
        basename = props.get("BASENAME", "")

        matched_name = match_city_name(name) or match_city_name(basename)
        if matched_name:
            props["NAME"] = matched_name  # Normalize to our clean name
            props["county"] = CITY_TO_COUNTY[matched_name]
            filtered.append(feat)

    geojson["features"] = filtered
    print(f"   Filtered to {len(filtered)} Bay Area cities")

    matched = {f["properties"]["NAME"] for f in filtered}
    missing = ALLOWED_CITIES - matched
    if missing:
        print(f"   WARN Missing cities ({len(missing)}): {sorted(missing)}")

    save_geojson(geojson, "cities.geojson")


# ---------------------------------------------------------------------------
# B. County Boundaries
# ---------------------------------------------------------------------------


def fetch_counties():
    """Fetch boundaries for the 9 Bay Area counties."""
    print("\n[2/6] Fetching county boundaries from Census TIGERweb...")

    # County names to search for
    county_names = ["Alameda", "Contra Costa", "Marin", "Napa",
                    "San Francisco", "San Mateo", "Santa Clara", "Solano", "Sonoma"]

    # Try different layer IDs (varies across TIGERweb services)
    layer_ids = [86, 84, 100, 82]
    geojson = None

    for layer_id in layer_ids:
        base = f"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/{layer_id}/query"
        # Use STATE filter with FIPS codes
        where_clause = f"STATE='06' AND COUNTY IN ({BAY_AREA_COUNTY_FIPS})"
        params = urllib.parse.urlencode({
            "where": where_clause,
            "outFields": "NAME,BASENAME,GEOID,COUNTY,STATE",
            "outSR": "4326",
            "f": "geojson",
        })
        url = f"{base}?{params}"

        try:
            raw = fetch_url(url, timeout=180)
            data = json.loads(raw)
            if "features" in data and len(data["features"]) > 0:
                geojson = data
                print(f"   Using layer {layer_id}, got {len(data['features'])} county features")
                break
            else:
                print(f"   Layer {layer_id}: no features, trying next...")
        except Exception as e:
            print(f"   Layer {layer_id} failed: {e}, trying next...")

    if not geojson or "features" not in geojson or len(geojson["features"]) == 0:
        # Fallback: try a broader query by state only, then filter by name
        print("   Trying fallback: query all CA counties and filter by name...")
        for layer_id in layer_ids:
            base = f"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/{layer_id}/query"
            params = urllib.parse.urlencode({
                "where": "STATE='06'",
                "outFields": "NAME,BASENAME,GEOID,COUNTY,STATE",
                "outSR": "4326",
                "f": "geojson",
                "resultRecordCount": "100",
            })
            url = f"{base}?{params}"
            try:
                raw = fetch_url(url, timeout=180)
                data = json.loads(raw)
                if "features" in data and len(data["features"]) > 0:
                    # Filter by county name
                    county_lower = {n.lower() for n in county_names}
                    filtered = []
                    for feat in data["features"]:
                        props = feat.get("properties", {})
                        name = (props.get("NAME", "") or "").strip()
                        basename = (props.get("BASENAME", "") or "").strip()
                        # Check direct match or suffix-stripped match
                        for n in [name, basename]:
                            nl = n.lower().replace(" county", "")
                            if nl in county_lower:
                                filtered.append(feat)
                                break
                    if filtered:
                        geojson = {"type": "FeatureCollection", "features": filtered}
                        print(f"   Fallback layer {layer_id}: filtered to {len(filtered)} Bay Area counties")
                        break
            except Exception:
                continue

    if geojson and "features" in geojson and len(geojson["features"]) > 0:
        print(f"   Received {len(geojson['features'])} county features")
        save_geojson(geojson, "counties.geojson")
    else:
        print("   WARN: Could not fetch county boundaries from any layer")


# ---------------------------------------------------------------------------
# Overpass helpers
# ---------------------------------------------------------------------------

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def query_overpass(query, timeout=120):
    """POST an Overpass QL query and return parsed JSON."""
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    req = urllib.request.Request(
        OVERPASS_URL,
        data=data,
        headers={"User-Agent": "OAK-BayArea-Map/1.0"},
    )
    with urllib.request.urlopen(req, timeout=max(timeout + 30, 150)) as resp:
        return json.loads(resp.read().decode("utf-8"))


def build_node_lookup(elements):
    """Build a dict {node_id: (lon, lat)} from Overpass elements."""
    nodes = {}
    for el in elements:
        if el["type"] == "node" and "lon" in el and "lat" in el:
            nodes[el["id"]] = (el["lon"], el["lat"])
    return nodes


def ways_to_linestrings(elements, nodes, prop_keys=None):
    """Convert Overpass way elements to GeoJSON LineString features."""
    features = []
    for el in elements:
        if el["type"] != "way":
            continue
        coords = []
        for nid in el.get("nodes", []):
            if nid in nodes:
                coords.append(list(nodes[nid]))
        if len(coords) < 2:
            continue

        props = {}
        tags = el.get("tags", {})
        if prop_keys:
            for k in prop_keys:
                if k in tags:
                    props[k] = tags[k]
        else:
            props = tags

        features.append({
            "type": "Feature",
            "properties": props,
            "geometry": {"type": "LineString", "coordinates": coords},
        })
    return features


def relation_to_linestrings(elements, nodes):
    """Convert Overpass relation elements into GeoJSON MultiLineString features.

    Each relation becomes one MultiLineString built from its member ways.
    """
    # Index ways by id
    way_index = {}
    for el in elements:
        if el["type"] == "way":
            coords = [list(nodes[nid]) for nid in el.get("nodes", []) if nid in nodes]
            if len(coords) >= 2:
                way_index[el["id"]] = coords

    features = []
    for el in elements:
        if el["type"] != "relation":
            continue
        lines = []
        for member in el.get("members", []):
            if member["type"] == "way" and member["ref"] in way_index:
                lines.append(way_index[member["ref"]])
        if not lines:
            continue

        tags = el.get("tags", {})
        props = {k: tags[k] for k in ("name", "colour", "color", "ref", "operator") if k in tags}

        geom_type = "MultiLineString" if len(lines) > 1 else "LineString"
        coords = lines if len(lines) > 1 else lines[0]

        features.append({
            "type": "Feature",
            "properties": props,
            "geometry": {"type": geom_type, "coordinates": coords},
        })
    return features


# ---------------------------------------------------------------------------
# C. BART Routes
# ---------------------------------------------------------------------------


def fetch_bart_routes():
    """Fetch BART rail routes from Overpass and convert to GeoJSON."""
    print("\n[3/6] Fetching BART routes from Overpass API...")
    query = """
[out:json][timeout:120];
(
  relation["route"="train"]["operator"~"BART|Bay Area Rapid Transit"](37.3,-122.5,38.1,-121.7);
);
out body;
>;
out skel qt;
"""
    result = query_overpass(query, timeout=120)
    elements = result.get("elements", [])
    print(f"   Received {len(elements)} Overpass elements")

    nodes = build_node_lookup(elements)
    features = relation_to_linestrings(elements, nodes)

    # If no relations found, fall back to collecting ways directly
    if not features:
        print("   No relations found, collecting ways...")
        features = ways_to_linestrings(elements, nodes, prop_keys=["name", "ref", "operator", "colour"])

    geojson = {"type": "FeatureCollection", "features": features}
    print(f"   Built {len(features)} BART route features")
    save_geojson(geojson, "bart_routes.geojson")


# ---------------------------------------------------------------------------
# D. BART Stations
# ---------------------------------------------------------------------------


def fetch_bart_stations():
    """Fetch BART station nodes from Overpass and convert to GeoJSON Points."""
    print("\n[4/6] Fetching BART stations from Overpass API...")
    query = """
[out:json][timeout:60];
(
  node["railway"="station"]["operator"~"BART|Bay Area Rapid Transit"](37.3,-122.5,38.1,-121.7);
);
out body;
"""
    result = query_overpass(query, timeout=60)
    elements = result.get("elements", [])
    print(f"   Received {len(elements)} station elements")

    features = []
    for el in elements:
        if el["type"] != "node" or "lon" not in el or "lat" not in el:
            continue
        tags = el.get("tags", {})
        features.append({
            "type": "Feature",
            "properties": {"name": tags.get("name", "Unknown")},
            "geometry": {
                "type": "Point",
                "coordinates": [el["lon"], el["lat"]],
            },
        })

    geojson = {"type": "FeatureCollection", "features": features}
    print(f"   Built {len(features)} station features")
    save_geojson(geojson, "bart_stations.geojson")


# ---------------------------------------------------------------------------
# E. Major Highways
# ---------------------------------------------------------------------------


def fetch_highways():
    """Fetch motorway ways from Overpass and convert to GeoJSON LineStrings."""
    print("\n[5/6] Fetching major highways from Overpass API...")
    query = """
[out:json][timeout:120];
(
  way["highway"="motorway"](37.1,-122.8,38.6,-121.2);
);
out body;
>;
out skel qt;
"""
    result = query_overpass(query, timeout=120)
    elements = result.get("elements", [])
    print(f"   Received {len(elements)} Overpass elements")

    nodes = build_node_lookup(elements)
    features = ways_to_linestrings(elements, nodes, prop_keys=["ref", "name"])

    geojson = {"type": "FeatureCollection", "features": features}
    print(f"   Built {len(features)} highway features")
    save_geojson(geojson, "highways.geojson")


# ---------------------------------------------------------------------------
# F. OAK Airport
# ---------------------------------------------------------------------------


def ways_to_polygon(elements, nodes):
    """Convert Overpass way/relation elements to GeoJSON Polygon features for an aerodrome."""
    features = []

    # Index ways
    way_coords = {}
    for el in elements:
        if el["type"] == "way":
            coords = [list(nodes[nid]) for nid in el.get("nodes", []) if nid in nodes]
            if coords:
                way_coords[el["id"]] = coords

    # Try relations first (multipolygon)
    for el in elements:
        if el["type"] != "relation":
            continue
        tags = el.get("tags", {})
        outer_rings = []
        for member in el.get("members", []):
            if member["type"] == "way" and member.get("role") == "outer" and member["ref"] in way_coords:
                outer_rings.append(way_coords[member["ref"]])
        if not outer_rings:
            # fall back: collect all member ways
            for member in el.get("members", []):
                if member["type"] == "way" and member["ref"] in way_coords:
                    outer_rings.append(way_coords[member["ref"]])
        if outer_rings:
            # Merge outer rings into one ring if possible
            ring = merge_way_coords(outer_rings)
            features.append({
                "type": "Feature",
                "properties": {"name": tags.get("name", "Oakland International Airport")},
                "geometry": {"type": "Polygon", "coordinates": [ring]},
            })

    # If no relation, try standalone closed ways
    if not features:
        for el in elements:
            if el["type"] != "way":
                continue
            tags = el.get("tags", {})
            if "aeroway" not in tags:
                continue
            coords = way_coords.get(el["id"], [])
            if len(coords) >= 4:
                # Close the ring if not already closed
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                features.append({
                    "type": "Feature",
                    "properties": {"name": tags.get("name", "Oakland International Airport")},
                    "geometry": {"type": "Polygon", "coordinates": [coords]},
                })

    return features


def merge_way_coords(segments):
    """Merge a list of coordinate arrays into one continuous ring.

    Tries to chain segments end-to-start by matching endpoints.
    Falls back to simple concatenation if chaining fails.
    """
    if not segments:
        return []
    if len(segments) == 1:
        ring = segments[0]
        if ring and ring[0] != ring[-1]:
            ring.append(ring[0])
        return ring

    # Try to chain segments
    remaining = list(segments)
    chain = list(remaining.pop(0))
    changed = True
    while remaining and changed:
        changed = False
        for i, seg in enumerate(remaining):
            if not seg:
                remaining.pop(i)
                changed = True
                break
            # Check if seg start matches chain end
            if seg[0] == chain[-1]:
                chain.extend(seg[1:])
                remaining.pop(i)
                changed = True
                break
            # Check if seg end matches chain end (reverse)
            if seg[-1] == chain[-1]:
                chain.extend(reversed(seg[:-1]))
                remaining.pop(i)
                changed = True
                break
            # Check if seg end matches chain start
            if seg[-1] == chain[0]:
                chain = seg[:-1] + chain
                remaining.pop(i)
                changed = True
                break
            # Check if seg start matches chain start (reverse)
            if seg[0] == chain[0]:
                chain = list(reversed(seg[1:])) + chain
                remaining.pop(i)
                changed = True
                break

    # Append any unchained segments
    for seg in remaining:
        chain.extend(seg)

    # Close the ring
    if chain and chain[0] != chain[-1]:
        chain.append(chain[0])

    return chain


def fetch_oak_airport():
    """Fetch OAK airport boundary from Overpass and convert to GeoJSON Polygon."""
    print("\n[6/6] Fetching OAK airport boundary from Overpass API...")
    query = """
[out:json][timeout:30];
(
  way["aeroway"="aerodrome"]["name"~"Oakland International"](37.7,-122.3,37.75,-122.2);
  relation["aeroway"="aerodrome"]["name"~"Oakland International"](37.7,-122.3,37.75,-122.2);
);
out body;
>;
out skel qt;
"""
    result = query_overpass(query, timeout=30)
    elements = result.get("elements", [])
    print(f"   Received {len(elements)} Overpass elements")

    nodes = build_node_lookup(elements)
    features = ways_to_polygon(elements, nodes)

    geojson = {"type": "FeatureCollection", "features": features}
    print(f"   Built {len(features)} airport features")
    save_geojson(geojson, "oak_airport.geojson")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    print("=" * 60)
    print("OAK Bay Area Map - GeoJSON Data Pipeline")
    print("=" * 60)

    ensure_data_dir()

    steps = [
        ("City boundaries", fetch_cities),
        ("County boundaries", fetch_counties),
        ("BART routes", fetch_bart_routes),
        ("BART stations", fetch_bart_stations),
        ("Major highways", fetch_highways),
        ("OAK airport", fetch_oak_airport),
    ]

    errors = []
    for i, (label, func) in enumerate(steps):
        try:
            func()
        except (urllib.error.URLError, urllib.error.HTTPError) as e:
            print(f"   FAIL Network error fetching {label}: {e}")
            errors.append(label)
        except Exception as e:
            print(f"   FAIL Error processing {label}: {e}")
            errors.append(label)

        # Polite pause between API calls (skip after the last one)
        if i < len(steps) - 1:
            polite_pause()

    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    for fname in sorted(os.listdir(DATA_DIR)):
        if fname.endswith(".geojson"):
            fpath = os.path.join(DATA_DIR, fname)
            size_kb = os.path.getsize(fpath) / 1024
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            n_features = len(data.get("features", []))
            print(f"  {fname:<25s}  {size_kb:>8.1f} KB  {n_features:>4d} features")

    print("\n[OK] All GeoJSON files saved to:", DATA_DIR)
    print("[OK] Data pipeline complete!")


if __name__ == "__main__":
    main()
