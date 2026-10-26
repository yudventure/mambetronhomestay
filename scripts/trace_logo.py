"""Trace the raster logo into vector paths.

Usage: python3 scripts/trace_logo.py brand/logo/sumber/mambetron-logo-asli.png brand/logo/sumber/logo-traced.json

The logo is one colour: a man resting in a hammock between two coconut
palms on a small sand island, the word MAMBETRON under it and HOMESTAY
under that. The source is a screenshot with a display colour profile, so
it is converted to sRGB first. Output JSON holds

  contours      every closed contour as an SVG path with its nesting depth
                (0 = ink shape, 1 = hole, 2 = ink inside a hole...) and
                bounding box, in pixels of the cropped logo
  bagian        bounding boxes of the three bands: ilustrasi, kata, homestay
  warna         ink colour of the lettering and of the drawing, in sRGB
  hull          outline around the whole logo grown by RIM, for stickers
  hullIlustrasi outline around the drawing alone, for badges on busy grounds
"""
import io
import json
import sys
import time

import numpy as np
import potrace
from PIL import Image, ImageCms, ImageDraw, ImageFilter

SCALE = 3
PAD = 30
# white rim around the logo on dark grounds and stickers, in source px
RIM = 10
# extra closing so the drawing, the word and HOMESTAY become one sticker shape
CLOSE = 24


def srgb(path):
    img = Image.open(path)
    icc = img.info.get("icc_profile")
    rgb = img.convert("RGB")
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        rgb = ImageCms.profileToProfile(rgb, src, ImageCms.createProfile("sRGB"))
    return rgb


def load(path):
    rgb = srgb(path)
    gray = np.array(rgb.convert("L"))
    ys, xs = np.where(gray < 180)
    x0, y0 = max(xs.min() - PAD, 0), max(ys.min() - PAD, 0)
    x1, y1 = min(xs.max() + PAD, gray.shape[1]), min(ys.max() + PAD, gray.shape[0])
    crop = rgb.crop((x0, y0, x1, y1))
    big = crop.convert("L").resize((crop.width * SCALE, crop.height * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.GaussianBlur(SCALE * 0.5))
    bits = np.array(big) < 180
    return bits, np.array(crop).astype(int), tuple(int(v) for v in (x0, y0, x1 - x0, y1 - y0))


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
    """Grow the shapes by rim (and close gaps up to close) on a padded canvas
    so nothing touches the border, fill holes and trace. Returns an SVG path
    in cropped source pixels."""
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


def bands(bits):
    """Split the logo into its three horizontal bands at the empty rows."""
    rows = np.where(bits.any(axis=1))[0]
    gaps = np.where(np.diff(rows) > 8 * SCALE)[0]
    edges = [rows[0]] + [v for g in gaps for v in (rows[g], rows[g + 1])] + [rows[-1]]
    spans = [(int(edges[i]), int(edges[i + 1])) for i in range(0, len(edges), 2)]
    if len(spans) != 3:
        raise SystemExit(f"expected 3 bands (drawing, word, HOMESTAY), found {len(spans)}: {spans}")
    out = []
    for a, b in spans:
        cols = np.where(bits[a:b + 1].any(axis=0))[0]
        out.append([int(cols.min()), a, int(cols.max()), b])
    return out


def main(src, out):
    t = time.time()
    bits, rgb, crop = load(src)
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

    s = 1.0 / SCALE
    ilu, kata, hs = bands(bits)
    ilu_bits = bits.copy()
    ilu_bits[ilu[3] + 1:] = False

    def warna(box):
        x0, y0, x1, y1 = [int(round(v * s)) for v in box]
        part = rgb[y0:y1 + 1, x0:x1 + 1]
        m = part.sum(axis=2) < 400
        return "#%02X%02X%02X" % tuple(int(v) for v in np.median(part[m], axis=0))

    data = {
        "width": w, "height": h, "sourceCrop": crop, "rim": RIM,
        "contours": contours,
        "bagian": {k: [round(v * s, 2) for v in b] for k, b in (("ilustrasi", ilu), ("kata", kata), ("homestay", hs))},
        "warna": {"kata": warna(kata), "ilustrasi": warna(ilu)},
        "hull": outline(bits, RIM, CLOSE),
        "hullIlustrasi": outline(ilu_bits, RIM, CLOSE),
    }
    with open(out, "w") as f:
        json.dump(data, f)
    print(f"{len(contours)} contours, bagian {data['bagian']}, warna {data['warna']} in {time.time() - t:.1f}s -> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
