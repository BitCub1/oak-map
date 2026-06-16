#!/usr/bin/env python3
"""
simplify_geojson.py - Simplify GeoJSON polygons by reducing coordinate precision
and removing excess points for browser performance.
"""
import json
import os
import sys
import math

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def round_coords(coords, precision=5):
    """Round coordinates to given decimal precision."""
    if isinstance(coords[0], (int, float)):
        return [round(c, precision) for c in coords]
    return [round_coords(c, precision) for c in coords]


def simplify_line(points, tolerance):
    """Douglas-Peucker line simplification."""
    if len(points) <= 2:
        return points

    # Find the point with the maximum distance from the line start->end
    dmax = 0
    index = 0
    start = points[0]
    end = points[-1]

    for i in range(1, len(points) - 1):
        d = point_line_distance(points[i], start, end)
        if d > dmax:
            dmax = d
            index = i

    if dmax > tolerance:
        left = simplify_line(points[:index + 1], tolerance)
        right = simplify_line(points[index:], tolerance)
        return left[:-1] + right
    else:
        return [start, end]


def point_line_distance(point, start, end):
    """Perpendicular distance from point to line segment."""
    dx = end[0] - start[0]
    dy = end[1] - start[1]

    if dx == 0 and dy == 0:
        return math.sqrt((point[0] - start[0])**2 + (point[1] - start[1])**2)

    t = max(0, min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)))
    proj_x = start[0] + t * dx
    proj_y = start[1] + t * dy

    return math.sqrt((point[0] - proj_x)**2 + (point[1] - proj_y)**2)


def simplify_geometry(geometry, tolerance):
    """Simplify a GeoJSON geometry."""
    geom_type = geometry.get("type", "")
    coords = geometry.get("coordinates", [])

    if geom_type == "Polygon":
        new_rings = []
        for ring in coords:
            simplified = simplify_line(ring, tolerance)
            if len(simplified) >= 4:
                new_rings.append(simplified)
            else:
                new_rings.append(ring)  # Keep original if too simplified
        geometry["coordinates"] = new_rings

    elif geom_type == "MultiPolygon":
        new_polys = []
        for polygon in coords:
            new_rings = []
            for ring in polygon:
                simplified = simplify_line(ring, tolerance)
                if len(simplified) >= 4:
                    new_rings.append(simplified)
                else:
                    new_rings.append(ring)
            new_polys.append(new_rings)
        geometry["coordinates"] = new_polys

    elif geom_type == "LineString":
        simplified = simplify_line(coords, tolerance)
        if len(simplified) >= 2:
            geometry["coordinates"] = simplified

    elif geom_type == "MultiLineString":
        new_lines = []
        for line in coords:
            simplified = simplify_line(line, tolerance)
            if len(simplified) >= 2:
                new_lines.append(simplified)
        geometry["coordinates"] = new_lines

    return geometry


def count_coords(geometry):
    """Count total coordinate points in a geometry."""
    coords = geometry.get("coordinates", [])
    geom_type = geometry.get("type", "")

    if geom_type == "Point":
        return 1
    elif geom_type in ("LineString", "MultiPoint"):
        return len(coords)
    elif geom_type in ("Polygon", "MultiLineString"):
        return sum(len(ring) for ring in coords)
    elif geom_type == "MultiPolygon":
        return sum(sum(len(ring) for ring in poly) for poly in coords)
    return 0


def process_file(filename, tolerance, precision=5):
    """Simplify a GeoJSON file."""
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        print(f"  SKIP {filename} (not found)")
        return

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    original_size = os.path.getsize(path)
    total_before = 0
    total_after = 0

    for feat in data.get("features", []):
        geom = feat.get("geometry", {})
        total_before += count_coords(geom)
        simplify_geometry(geom, tolerance)
        geom["coordinates"] = round_coords(geom["coordinates"], precision)
        total_after += count_coords(geom)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))

    new_size = os.path.getsize(path)
    reduction = (1 - new_size / original_size) * 100 if original_size > 0 else 0

    print(f"  {filename}:")
    print(f"    Points: {total_before:,} -> {total_after:,}")
    print(f"    Size: {original_size/1024:,.1f} KB -> {new_size/1024:,.1f} KB ({reduction:.1f}% reduction)")


if __name__ == "__main__":
    print("Simplifying GeoJSON files for browser performance...")
    print()

    # Cities: moderate simplification (need recognizable boundaries)
    process_file("cities.geojson", tolerance=0.0003, precision=5)

    # Counties: more aggressive (larger shapes tolerate more)
    process_file("counties.geojson", tolerance=0.0005, precision=5)

    # Highways: moderate
    process_file("highways.geojson", tolerance=0.0002, precision=5)

    # BART routes: light simplification (need accuracy)
    process_file("bart_routes.geojson", tolerance=0.0001, precision=5)

    # Airport: light
    process_file("oak_airport.geojson", tolerance=0.0001, precision=5)

    # Stations: just round coords (no polygon simplification)
    process_file("bart_stations.geojson", tolerance=0, precision=5)

    print("\nDone!")
