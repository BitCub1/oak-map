import os
import sys
import numpy as np
from PIL import Image

def main():
    # Input path: default to the specific artifact image of the train icon
    input_path = r"C:\Users\SOUFI\.gemini\antigravity\brain\5b8cda8f-d219-4da0-881c-bfef4139b98c\media__1781587747500.jpg"
    output_path = r"C:\Users\SOUFI\Documents\antigravity\fervent-mendel\data\bart_icon.svg"
    
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
        
    print(f"Loading image from: {input_path}")
    if not os.path.exists(input_path):
        print(f"Error: input file {input_path} does not exist.")
        sys.exit(1)
        
    img = Image.open(input_path)
    print(f"Original size: {img.size}, mode: {img.mode}")
    
    # Grayscale
    gray = img.convert('L')
    arr_gray = np.array(gray)
    
    # Find bounding box of the black silhouette (dark pixels < 128)
    dark_pixels = np.argwhere(arr_gray < 128)
    if dark_pixels.size == 0:
        print("Error: No dark silhouette found in the image.")
        sys.exit(1)
        
    min_y, min_x = dark_pixels.min(axis=0)
    max_y, max_x = dark_pixels.max(axis=0)
    
    # Crop to the silhouette bounding box plus a tiny 1-pixel padding to avoid edge cuts
    padding = 1
    min_x = max(0, min_x - padding)
    min_y = max(0, min_y - padding)
    max_x = min(img.width - 1, max_x + padding)
    max_y = min(img.height - 1, max_y + padding)
    
    cropped = img.crop((min_x, min_y, max_x + 1, max_y + 1))
    print(f"Cropped size: {cropped.size} (X: {min_x}..{max_x}, Y: {min_y}..{max_y})")
    
    # For a clean icon, we resize it to a max dimension of 256 for a lighter SVG,
    # or keep it as is. Let's resize it to max 300 to keep the coordinate count low and clean.
    max_dim = 300
    if max(cropped.width, cropped.height) > max_dim:
        cropped.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        print(f"Resized for SVG tracing to: {cropped.size}")
        
    # Threshold the resized image
    gray_cropped = cropped.convert('L')
    arr_bin = np.array(gray_cropped) < 128 # True for silhouette (foreground)
    
    H, W = arr_bin.shape
    
    # Trace boundaries
    # We collect all directed grid edges.
    # Vertices are in coordinates (y, x).
    # Directed edge goes from p1 to p2.
    print("Collecting boundary edges...")
    edges = set()
    for y in range(H):
        for x in range(W):
            if arr_bin[y, x]:
                # Bottom/Top/Left/Right edges between 1 and 0 pixels
                # Top edge
                if y == 0 or not arr_bin[y-1, x]:
                    edges.add(((y, x), (y, x+1)))
                # Right edge
                if x == W-1 or not arr_bin[y, x+1]:
                    edges.add(((y, x+1), (y+1, x+1)))
                # Bottom edge
                if y == H-1 or not arr_bin[y+1, x]:
                    edges.add(((y+1, x+1), (y+1, x)))
                # Left edge
                if x == 0 or not arr_bin[y, x-1]:
                    edges.add(((y+1, x), (y, x)))
                    
    print(f"Total directed boundary edges found: {len(edges)}")
    
    # Chain edges into closed loops
    adj = {}
    for p1, p2 in edges:
        adj.setdefault(p1, []).append(p2)
        
    loops = []
    while adj:
        start = next(iter(adj))
        curr = start
        path = [curr]
        while True:
            if curr not in adj or not adj[curr]:
                break
            nxt = adj[curr].pop()
            if not adj[curr]:
                del adj[curr]
            curr = nxt
            path.append(curr)
            if curr == start:
                break
        if len(path) > 1:
            loops.append(path)
            
    print(f"Extracted {len(loops)} loops.")
    
    # Simplify loops by merging consecutive collinear segments
    simplified_loops = []
    total_original_points = 0
    total_simplified_points = 0
    
    for loop in loops:
        total_original_points += len(loop)
        if len(loop) <= 2:
            simplified_loops.append(loop)
            total_simplified_points += len(loop)
            continue
            
        simplified = [loop[0]]
        for i in range(1, len(loop)):
            pt = loop[i]
            prev = simplified[-1]
            if i < len(loop) - 1:
                nxt = loop[i+1]
            else:
                nxt = loop[0]
                
            dy1, dx1 = pt[0] - prev[0], pt[1] - prev[1]
            dy2, dx2 = nxt[0] - pt[0], nxt[1] - pt[1]
            
            # Check for collinearity (cross product dy1 * dx2 - dy2 * dx1 == 0)
            if dy1 * dx2 == dy2 * dx1:
                continue
            else:
                simplified.append(pt)
                
        # Handle the start/end connection simplification
        if len(simplified) >= 3:
            pt = simplified[0]
            prev = simplified[-1]
            nxt = simplified[1]
            dy1, dx1 = pt[0] - prev[0], pt[1] - prev[1]
            dy2, dx2 = nxt[0] - pt[0], nxt[1] - pt[1]
            if dy1 * dx2 == dy2 * dx1:
                simplified.pop(0)
                
        simplified_loops.append(simplified)
        total_simplified_points += len(simplified)
        
    print(f"Points simplified from {total_original_points} to {total_simplified_points}.")
    
    # Generate SVG path string (fill-rule="evenodd" to handle holes)
    path_d_parts = []
    for loop in simplified_loops:
        if len(loop) < 3:
            continue
        d = f"M {loop[0][1]} {loop[0][0]}"
        for pt in loop[1:]:
            d += f" L {pt[1]} {pt[0]}"
        d += " Z"
        path_d_parts.append(d)
        
    svg_d = " ".join(path_d_parts)
    
    # Output SVG template
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="100%">
  <path d="{svg_d}" fill="white" fill-rule="evenodd" />
</svg>
'''
    
    # Create output directory if it doesn't exist
    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
        
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
        
    print(f"Successfully wrote SVG icon to: {output_path}")

if __name__ == "__main__":
    main()
