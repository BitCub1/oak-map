#!/usr/bin/env python3
"""
Fix BART routes and OAK airport GeoJSON fetches.
Retries with corrected Overpass queries.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import io

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='ascii', errors='replace')

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def query_overpass(query, timeout=120):
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    req = urllib.request.Request(OVERPASS_URL, data=data,
                                 headers={"User-Agent": "OAK-BayArea-Map/1.0"})
    with urllib.request.urlopen(req, timeout=max(timeout + 30, 150)) as resp:
        return json.loads(resp.read().decode("utf-8"))


def build_node_lookup(elements):
    nodes = {}
    for el in elements:
        if el["type"] == "node" and "lon" in el and "lat" in el:
            nodes[el["id"]] = (el["lon"], el["lat"])
    return nodes


def save_geojson(data, filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    size_kb = os.path.getsize(path) / 1024
    print(f"   -> Saved {filename}  ({size_kb:,.1f} KB, {len(data.get('features', []))} features)")


# ---- BART Routes ----
def fetch_bart_routes():
    print("\n[1/2] Fetching BART routes...")

    # Use way-based query for rail lines tagged as BART
    query = """
[out:json][timeout:180];
(
  way["railway"="rail"]["operator"~"BART|Bay Area Rapid Transit"](37.3,-122.5,38.1,-121.7);
  way["railway"="light_rail"]["operator"~"BART|Bay Area Rapid Transit"](37.3,-122.5,38.1,-121.7);
  way["railway"="subway"]["operator"~"BART|Bay Area Rapid Transit"](37.3,-122.5,38.1,-121.7);
  way["railway"~"rail|subway"]["usage"="main"]["operator"~"BART"](37.3,-122.5,38.1,-121.7);
);
out body;
>;
out skel qt;
"""
    result = query_overpass(query, timeout=180)
    elements = result.get("elements", [])
    print(f"   Received {len(elements)} Overpass elements")

    nodes = build_node_lookup(elements)

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

        tags = el.get("tags", {})
        props = {}
        for k in ("name", "ref", "operator", "colour", "color"):
            if k in tags:
                props[k] = tags[k]

        features.append({
            "type": "Feature",
            "properties": props,
            "geometry": {"type": "LineString", "coordinates": coords},
        })

    # If still empty, try an even broader query
    if not features:
        print("   No features from way query, trying route relations...")
        query2 = """
[out:json][timeout:180];
(
  relation["type"="route"]["route"~"train|subway|rail"]["network"~"BART"](37.3,-122.5,38.1,-121.7);
  relation["type"="route"]["route"~"train|subway|rail"]["operator"~"BART"](37.3,-122.5,38.1,-121.7);
);
out body;
>;
out skel qt;
"""
        result = query_overpass(query2, timeout=180)
        elements = result.get("elements", [])
        print(f"   Received {len(elements)} relation elements")

        nodes = build_node_lookup(elements)

        # Index ways
        way_index = {}
        for el2 in elements:
            if el2["type"] == "way":
                wcoords = [list(nodes[nid]) for nid in el2.get("nodes", []) if nid in nodes]
                if len(wcoords) >= 2:
                    way_index[el2["id"]] = wcoords

        for el2 in elements:
            if el2["type"] != "relation":
                continue
            lines = []
            for member in el2.get("members", []):
                if member["type"] == "way" and member["ref"] in way_index:
                    lines.append(way_index[member["ref"]])
            if not lines:
                continue
            tags = el2.get("tags", {})
            props = {k: tags[k] for k in ("name", "colour", "color", "ref", "operator") if k in tags}
            geom_type = "MultiLineString" if len(lines) > 1 else "LineString"
            coords = lines if len(lines) > 1 else lines[0]
            features.append({
                "type": "Feature",
                "properties": props,
                "geometry": {"type": geom_type, "coordinates": coords},
            })

    geojson = {"type": "FeatureCollection", "features": features}
    print(f"   Built {len(features)} BART route features")
    save_geojson(geojson, "bart_routes.geojson")


# ---- OAK Airport ----
def fetch_oak_airport():
    print("\n[2/2] Fetching OAK airport boundary...")

    # Try multiple Overpass queries
    queries = [
        # Query 1: aerodrome relation/way
        """
[out:json][timeout:60];
(
  way["aeroway"="aerodrome"]["iata"="OAK"](37.68,-122.25,37.76,-122.18);
  relation["aeroway"="aerodrome"]["iata"="OAK"](37.68,-122.25,37.76,-122.18);
  way["aeroway"="aerodrome"]["name"~"Oakland International"](37.68,-122.25,37.76,-122.18);
  relation["aeroway"="aerodrome"]["name"~"Oakland International"](37.68,-122.25,37.76,-122.18);
);
out body;
>;
out skel qt;
""",
        # Query 2: broader bbox
        """
[out:json][timeout:60];
(
  way["aeroway"="aerodrome"](37.7,-122.3,37.75,-122.2);
  relation["aeroway"="aerodrome"](37.7,-122.3,37.75,-122.2);
);
out body;
>;
out skel qt;
""",
    ]

    for i, query in enumerate(queries):
        try:
            result = query_overpass(query, timeout=60)
            elements = result.get("elements", [])
            print(f"   Query {i+1}: received {len(elements)} elements")

            if not elements:
                continue

            nodes = build_node_lookup(elements)

            # Try to find aerodrome polygon
            features = []

            # Check relations first
            for el in elements:
                if el["type"] != "relation":
                    continue
                tags = el.get("tags", {})
                if "aeroway" not in tags:
                    continue

                # Build polygon from outer ways
                outer_coords = []
                for member in el.get("members", []):
                    if member["type"] == "way" and member.get("role", "") in ("outer", ""):
                        wcoords = []
                        for mel in elements:
                            if mel["type"] == "way" and mel["id"] == member["ref"]:
                                wcoords = [list(nodes[nid]) for nid in mel.get("nodes", []) if nid in nodes]
                                break
                        if wcoords:
                            outer_coords.extend(wcoords)

                if len(outer_coords) >= 4:
                    if outer_coords[0] != outer_coords[-1]:
                        outer_coords.append(outer_coords[0])
                    features.append({
                        "type": "Feature",
                        "properties": {"name": tags.get("name", "Oakland International Airport"), "code": "OAK"},
                        "geometry": {"type": "Polygon", "coordinates": [outer_coords]},
                    })

            # Check standalone ways
            if not features:
                for el in elements:
                    if el["type"] != "way":
                        continue
                    tags = el.get("tags", {})
                    if "aeroway" not in tags:
                        continue
                    wcoords = [list(nodes[nid]) for nid in el.get("nodes", []) if nid in nodes]
                    if len(wcoords) >= 4:
                        if wcoords[0] != wcoords[-1]:
                            wcoords.append(wcoords[0])
                        features.append({
                            "type": "Feature",
                            "properties": {"name": tags.get("name", "Oakland International Airport"), "code": "OAK"},
                            "geometry": {"type": "Polygon", "coordinates": [wcoords]},
                        })

            if features:
                geojson = {"type": "FeatureCollection", "features": features}
                print(f"   Built {len(features)} airport features")
                save_geojson(geojson, "oak_airport.geojson")
                return

        except Exception as e:
            print(f"   Query {i+1} failed: {e}")

    # Fallback: create a simple polygon for OAK from known coordinates
    print("   All Overpass queries failed, using hardcoded OAK boundary...")
    oak_polygon = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {"name": "Oakland International Airport", "code": "OAK"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-122.2346, 37.7285], [-122.2346, 37.7080],
                    [-122.2060, 37.7080], [-122.2060, 37.7285],
                    [-122.2346, 37.7285]
                ]]
            }
        }]
    }
    save_geojson(oak_polygon, "oak_airport.geojson")


if __name__ == "__main__":
    print("=" * 50)
    print("Fixing BART routes and OAK airport...")
    print("=" * 50)
    try:
        fetch_bart_routes()
    except Exception as e:
        print(f"   BART routes failed: {e}")

    time.sleep(5)  # Extra pause before next Overpass call

    try:
        fetch_oak_airport()
    except Exception as e:
        print(f"   OAK airport failed: {e}")

    print("\nDone!")
