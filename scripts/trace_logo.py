"""Trace the raster logo into layered vector paths.

Usage: python3 scripts/trace_logo.py brand/logo/sumber/mambetron-logo-asli.png brand/logo/sumber/logo-traced.json

Output JSON holds every closed contour as an SVG path string together with
its nesting depth (0 = black outer shape, 1 = white hole, 2 = black shape
inside a hole, ...) and bounding box, in source-pixel units (cropped).
"""
import json
import sys
import time

import numpy as np
import potrace
from PIL import Image, ImageDraw, ImageFilter

SCALE = 3
PAD = 24
# White rim around the silhouette for the sticker/negative version, in source px.
RIM = 10
# The oval sign is open between the left paw and the tail curl. These points
# (cropped source px) close it so the sign's interior can be filled.
BRIDGE = [(258, 668), (290, 690), (330, 698), (365, 694), (398, 684)]


def load_bitmap(path):
    img = Image.open(path).convert("L")
    arr = np.array(img)
    ys, xs = np.where(arr < 128)
    x0, y0 = max(xs.min() - PAD, 0), max(ys.min() - PAD, 0)
    x1, y1 = min(xs.max() + PAD, arr.shape[1]), min(ys.max() + PAD, arr.shape[0])
    crop = img.crop((x0, y0, x1, y1))
    big = crop.resize((crop.width * SCALE, crop.height * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.GaussianBlur(SCALE * 0.6))
    bits = np.array(big) < 128
    return bits, tuple(int(v) for v in (x0, y0, x1 - x0, y1 - y0))


def curve_to_d(curve):
    s = 1.0 / SCALE
    p = curve.start_point
    parts = [f"M{p.x * s:.2f} {p.y * s:.2f}"]
    for seg in curve.segments:
        if seg.is_corner:
            c, e = seg.c, seg.end_point
            parts.append(f"L{c.x * s:.2f} {c.y * s:.2f}L{e.x * s:.2f} {e.y * s:.2f}")
        else:
            a, b, e = seg.c1, seg.c2, seg.end_point
            parts.append(
                f"C{a.x * s:.2f} {a.y * s:.2f} {b.x * s:.2f} {b.y * s:.2f} {e.x * s:.2f} {e.y * s:.2f}"
            )
    parts.append("Z")
    return "".join(parts)


def polyline(curve, steps=8):
    s = 1.0 / SCALE
    pts = [(curve.start_point.x * s, curve.start_point.y * s)]
    cur = curve.start_point
    for seg in curve.segments:
        if seg.is_corner:
            pts += [(seg.c.x * s, seg.c.y * s), (seg.end_point.x * s, seg.end_point.y * s)]
        else:
            for k in range(1, steps + 1):
                t = k / steps
                mt = 1 - t
                x = mt**3 * cur.x + 3 * mt**2 * t * seg.c1.x + 3 * mt * t**2 * seg.c2.x + t**3 * seg.end_point.x
                y = mt**3 * cur.y + 3 * mt**2 * t * seg.c1.y + 3 * mt * t**2 * seg.c2.y + t**3 * seg.end_point.y
                pts.append((x * s, y * s))
        cur = seg.end_point
    return np.array(pts)


def inside(pt, poly):
    x, y = pt
    xs, ys = poly[:, 0], poly[:, 1]
    xj, yj = np.roll(xs, 1), np.roll(ys, 1)
    cond = ((ys > y) != (yj > y)) & (x < (xj - xs) * (y - ys) / (yj - ys + 1e-12) + xs)
    return bool(np.count_nonzero(cond) % 2)


def area(poly):
    x, y = poly[:, 0], poly[:, 1]
    return abs(float(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))) / 2


def bbox(curve):
    s = 1.0 / SCALE
    pts = [curve.start_point]
    for seg in curve.segments:
        pts += [seg.c, seg.end_point] if seg.is_corner else [seg.c1, seg.c2, seg.end_point]
    xs = [p.x * s for p in pts]
    ys = [p.y * s for p in pts]
    return [round(min(xs), 2), round(min(ys), 2), round(max(xs), 2), round(max(ys), 2)]


def dilate(mask, r):
    m = mask.copy()
    for i in range(r):
        n = m.copy()
        n[1:, :] |= m[:-1, :]
        n[:-1, :] |= m[1:, :]
        n[:, 1:] |= m[:, :-1]
        n[:, :-1] |= m[:, 1:]
        if i % 2:
            n[1:, 1:] |= m[:-1, :-1]
            n[:-1, :-1] |= m[1:, 1:]
            n[1:, :-1] |= m[:-1, 1:]
            n[:-1, 1:] |= m[1:, :-1]
        m = n
    return m


def hull_bitmap(bits):
    img = Image.fromarray((bits * 255).astype(np.uint8)).copy()
    ImageDraw.Draw(img).line([(x * SCALE, y * SCALE) for x, y in BRIDGE], fill=255,
                             width=8 * SCALE, joint="curve")
    m = dilate(np.array(img) > 127, RIM * SCALE)
    img = Image.fromarray((m * 255).astype(np.uint8)).copy()
    ImageDraw.floodfill(img, (0, 0), 128)
    return np.array(img) != 128


def drop_frame(plist, w, h):
    # potracer also emits the bitmap's own border as a contour, skip it
    return [c for c in plist if bbox(c) != [0.0, 0.0, float(w), float(h)]]


def main(src, out):
    t = time.time()
    bits, crop = load_bitmap(src)
    bm = potrace.Bitmap(bits)
    plist = bm.trace(turdsize=20 * SCALE, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                     alphamax=1.0, opticurve=True, opttolerance=0.2)
    plist = drop_frame(plist, crop[2], crop[3])
    polys = [polyline(c) for c in plist]
    contours = []
    for i, curve in enumerate(plist):
        probe = tuple(polys[i][0])
        depth = sum(1 for j, q in enumerate(polys) if j != i and area(q) > area(polys[i]) and inside(probe, q))
        contours.append({"d": curve_to_d(curve), "bbox": bbox(curve), "depth": depth,
                         "area": round(area(polys[i]), 1)})
    hull = potrace.Bitmap(hull_bitmap(bits)).trace(turdsize=200 * SCALE, alphamax=1.2,
                                                    opticurve=True, opttolerance=0.4)
    hull_d = "".join(curve_to_d(c) for c in drop_frame(hull, crop[2], crop[3]))
    data = {"width": crop[2], "height": crop[3], "sourceCrop": crop, "rim": RIM,
            "contours": contours, "hull": hull_d}
    with open(out, "w") as f:
        json.dump(data, f)
    print(f"{len(contours)} contours in {time.time() - t:.1f}s -> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
