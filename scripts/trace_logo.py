"""Trace the raster logo into layered vector paths.

Usage: python3 scripts/trace_logo.py brand/logo/sumber/mambetron-logo-asli.png brand/logo/sumber/logo-traced.json

The logo is a kuskus head peeking over a horizontal line, the word
"mambetron" under it and HOMESTAY under that. Output JSON holds

  contours      every closed contour as an SVG path with its nesting depth
                (0 = black shape, 1 = white hole, 2 = black inside a hole...)
                and bounding box, in source pixels of the cropped logo
  lidah         index of the hole that is the pink tongue
  garis         bounding box of the horizontal line
  teksAtas      y where the lettering starts
  kepala        bounding box of the head (ears to snout, without the line)
  hullKepala    head outline grown by RIM, for the white rim on dark grounds
  hull          outline around the whole logo, for die-cut stickers
"""
import json
import sys
import time

import numpy as np
import potrace
from PIL import Image, ImageDraw, ImageFilter

SCALE = 3
PAD = 30
# white rim around the head on dark grounds, and around the sticker, in source px
RIM = 9
# extra closing for the sticker outline so head, line and words become one shape
CLOSE = 26


def load(path):
    img = Image.open(path).convert("RGB")
    gray = np.array(img.convert("L"))
    ys, xs = np.where(gray < 128)
    x0, y0 = max(xs.min() - PAD, 0), max(ys.min() - PAD, 0)
    x1, y1 = min(xs.max() + PAD, gray.shape[1]), min(ys.max() + PAD, gray.shape[0])
    crop = img.crop((x0, y0, x1, y1))
    big = crop.convert("L").resize((crop.width * SCALE, crop.height * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.GaussianBlur(SCALE * 0.6))
    bits = np.array(big) < 128
    rgb = np.array(crop).astype(int)
    pink = (rgb[..., 0] > 150) & (rgb[..., 0] - rgb[..., 1] > 30) & (rgb[..., 0] - rgb[..., 2] > 20)
    return bits, pink, tuple(int(v) for v in (x0, y0, x1 - x0, y1 - y0))


def curve_to_d(curve, off=0.0):
    s = 1.0 / SCALE
    X = lambda v: f"{v * s - off:.2f}"
    p = curve.start_point
    parts = [f"M{X(p.x)} {X(p.y)}"]
    for seg in curve.segments:
        if seg.is_corner:
            c, e = seg.c, seg.end_point
            parts.append(f"L{X(c.x)} {X(c.y)}L{X(e.x)} {X(e.y)}")
        else:
            a, b, e = seg.c1, seg.c2, seg.end_point
            parts.append(f"C{X(a.x)} {X(a.y)} {X(b.x)} {X(b.y)} {X(e.x)} {X(e.y)}")
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


def bbox(poly):
    return [round(float(poly[:, 0].min()), 2), round(float(poly[:, 1].min()), 2),
            round(float(poly[:, 0].max()), 2), round(float(poly[:, 1].max()), 2)]


def grow(mask, r):
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


def shrink(mask, r):
    return ~grow(~mask, r)


def fill_holes(mask):
    img = Image.fromarray((mask * 255).astype(np.uint8)).copy()
    ImageDraw.floodfill(img, (0, 0), 128)
    return np.array(img) != 128


def outline(bits, rim, close=0):
    """Grow the black shapes by rim (and close gaps up to close) on a padded
    canvas so nothing touches the border, then fill holes and trace. Returns
    the outline as an SVG path in cropped source pixels."""
    m = (rim + close) * SCALE + 12
    big = np.pad(bits, m)
    g = grow(big, (rim + close) * SCALE)
    if close:
        g = shrink(g, close * SCALE)
    g = fill_holes(g)
    plist = potrace.Bitmap(g).trace(turdsize=200 * SCALE, alphamax=1.2, opticurve=True, opttolerance=0.4)
    H, W = g.shape
    out = []
    for c in plist:
        if bbox(polyline(c)) == [0.0, 0.0, float(W) / SCALE, float(H) / SCALE]:
            continue
        out.append(curve_to_d(c, off=m / SCALE))
    return "".join(out)


def parts(bits):
    """Find the line, the lettering and the head in the big bitmap."""
    H, W = bits.shape
    # the line reaches further left than the head; the first band of rows with
    # black near the left edge is the line, the next one is the lettering
    left = np.where(bits[:, : int(W * 0.22)].any(axis=1))[0]
    brk = np.where(np.diff(left) > 1)[0]
    line_rows = left[: brk[0] + 1] if len(brk) else left
    l0, l1 = int(line_rows.min()), int(line_rows.max())
    cols = np.where(bits[l0:l1 + 1].any(axis=0))[0]
    gx0, gx1 = int(cols.min()), int(cols.max())
    # lettering: first row under the line where black spans most of the width
    text_top = None
    for y in range(l1 + 1, H):
        xs = np.where(bits[y])[0]
        if len(xs) and xs.max() - xs.min() > W * 0.4:
            text_top = y
            break
    # snout: black under the line that is connected to it (the b and t
    # ascenders of the lettering also sit here but do not touch the line)
    band = bits[l1 + 1:text_top].copy()
    img = Image.fromarray((band * 255).astype(np.uint8)).copy()
    for x in np.where(band[0])[0]:
        if img.getpixel((int(x), 0)) == 255:
            ImageDraw.floodfill(img, (int(x), 0), 128)
    tag = np.array(img)
    snout = tag == 128
    rest = tag == 255
    sc = np.where(snout.any(axis=0))[0]
    sx0, sx1 = int(sc.min()), int(sc.max())
    ry = np.where(rest.any(axis=1))[0]
    if len(ry):
        text_top = l1 + 1 + int(ry.min())
    head = bits.copy()
    head[l1 + 1:] = False
    head[l1 + 1:l1 + 1 + snout.shape[0]] |= snout
    head[l0:l1 + 1, :sx0] = False
    head[l0:l1 + 1, sx1 + 1:] = False
    # the head body stops at the line, keep only what sits above it or is the snout
    hy = np.where(head.any(axis=1))[0]
    hx = np.where(head[:l0].any(axis=0))[0]
    return {
        "garis": (gx0, l0, gx1, l1), "teksAtas": text_top, "moncong": (sx0, sx1),
        "kepala": (int(hx.min()), int(hy.min()), int(hx.max()), int(hy.max())), "maskKepala": head,
    }


def main(src, out):
    t = time.time()
    bits, pink, crop = load(src)
    w, h = crop[2], crop[3]
    plist = potrace.Bitmap(bits).trace(turdsize=6 * SCALE, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                                       alphamax=1.0, opticurve=True, opttolerance=0.2)
    polys = [polyline(c) for c in plist]
    keep = [i for i, p in enumerate(polys) if bbox(p) != [0.0, 0.0, float(w), float(h)]]
    plist = [plist[i] for i in keep]
    polys = [polys[i] for i in keep]
    contours = []
    for i, curve in enumerate(plist):
        probe = tuple(polys[i][0])
        depth = sum(1 for j, q in enumerate(polys) if j != i and area(q) > area(polys[i]) and inside(probe, q))
        contours.append({"d": curve_to_d(curve), "bbox": bbox(polys[i]), "depth": depth,
                         "area": round(area(polys[i]), 1)})

    # the tongue is the hole whose box covers the pink pixels
    ys, xs = np.where(pink)
    lidah = None
    if len(xs):
        cx, cy = xs.mean(), ys.mean()
        cands = [i for i, c in enumerate(contours) if c["depth"] % 2 == 1
                 and c["bbox"][0] <= cx <= c["bbox"][2] and c["bbox"][1] <= cy <= c["bbox"][3]]
        if cands:
            lidah = min(cands, key=lambda i: contours[i]["area"])

    p = parts(bits)
    s = 1.0 / SCALE

    data = {
        "width": w, "height": h, "sourceCrop": crop, "rim": RIM,
        "contours": contours, "lidah": lidah,
        "garis": [round(v * s, 2) for v in p["garis"]],
        "teksAtas": round(p["teksAtas"] * s, 2),
        "moncong": [round(v * s, 2) for v in p["moncong"]],
        "kepala": [round(v * s, 2) for v in p["kepala"]],
        "hullKepala": outline(p["maskKepala"], RIM),
        "hull": outline(bits, RIM, CLOSE),
    }
    with open(out, "w") as f:
        json.dump(data, f)
    print(f"{len(contours)} contours, lidah {lidah}, garis {data['garis']}, teks {data['teksAtas']}, "
          f"kepala {data['kepala']} in {time.time() - t:.1f}s -> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
