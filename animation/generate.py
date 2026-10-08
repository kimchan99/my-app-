#!/usr/bin/env python3
"""Mandarin-square rank badge background with a hand-drawn "line boil".

Renders numbered PNG frames (frame_0000.png ...) of an embroidered
mandarin square: nested neon meander borders, gold-thread clouds, a flame
halo, rocks and seigaiha waves on black silk. Every line is redrawn with a
small random wobble a few times per second (the boil), the gold thread has
a sweeping metallic shimmer and the neon pulses; all of it loops cleanly.

It also writes kosukuma_cut.png: the bear on a transparent canvas the same
size as the frames, positioned to stand on the central rock, so it can be
laid over the video with `overlay=0:0`.
"""
import argparse
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W = 1080            # output size (square)
SS = 2              # supersampling for anti-aliased drawing
N_FRAMES = 144      # 4 s at 36 fps
BOIL_HOLD = 3       # each boil drawing is held 3 frames (12 drawings/s)
BOIL_DRAWINGS = 4   # number of distinct boil drawings cycled
C = W / 2

PANEL = (214, 866)  # inner embroidered panel (x0 == y0, x1 == y1)
HALO_C = (C, 500)   # centre of the flame halo behind the bear
BEAR_H = 400        # bear height on the canvas
BEAR_FEET_Y = 712   # where the bear's feet land (top of the central rock)

DARK = (34, 20, 8)          # couching / outline thread
GOLD = (222, 174, 78)
GOLD_LIGHT = (246, 212, 128)
GOLD_DEEP = (176, 120, 40)
TEAL = (34, 120, 128)
TEAL_DARK = (10, 36, 44)
FLAME_OUT = (214, 82, 34)
FLAME_IN = (250, 186, 70)

NEON_CYAN = (40, 236, 255)
NEON_MAGENTA = (255, 54, 206)
NEON_GOLD = (255, 196, 64)
NEON_LIME = (150, 255, 90)

# stitch direction (degrees) per embroidery group id
G_CLOUD, G_FLAME, G_WAVE, G_ROCK = 1, 2, 3, 4
STITCH_ANGLE = {G_CLOUD: 35, G_FLAME: 100, G_WAVE: 62, G_ROCK: 90}


# --------------------------------------------------------------------------
# geometry helpers
# --------------------------------------------------------------------------
def wobble(pts, rng, amp, step=9.0, closed=False):
    """Subdivide a polyline and push every vertex by smooth random noise."""
    pts = np.asarray(pts, float)
    if closed:
        pts = np.vstack([pts, pts[:1]])
    out = []
    for a, b in zip(pts[:-1], pts[1:]):
        n = max(1, int(np.hypot(*(b - a)) / step))
        for i in range(n):
            out.append(a + (b - a) * i / n)
    out.append(pts[-1])
    out = np.array(out)
    off = rng.normal(0, amp * 1.8, out.shape)
    k = np.array([1, 2, 3, 2, 1], float)
    k /= k.sum()
    for j in range(2):
        mode = "wrap" if closed else "edge"
        off[:, j] = np.convolve(np.pad(off[:, j], 2, mode=mode), k, "valid")
    if closed:
        off[-1] = off[0]
    return out + off


def rotate(pts, deg, cx=C, cy=C):
    a = math.radians(deg)
    ca, sa = math.cos(a), math.sin(a)
    p = np.asarray(pts, float) - (cx, cy)
    return np.stack([p[:, 0] * ca - p[:, 1] * sa, p[:, 0] * sa + p[:, 1] * ca], 1) + (cx, cy)


def mirror_x(pts):
    p = np.array(pts, float)
    p[:, 0] = W - p[:, 0]
    return p


def spiral(cx, cy, r0, r1, turns, start_deg, direction=1, n=60):
    t = np.linspace(0, 1, n)
    r = r0 + (r1 - r0) * t
    a = np.radians(start_deg) + direction * t * turns * 2 * math.pi
    return np.stack([cx + r * np.cos(a), cy + r * np.sin(a)], 1)


def circle_pts(cx, cy, r, n=None):
    n = n or max(16, int(r * 0.9))
    a = np.linspace(0, 2 * math.pi, n, endpoint=False)
    return np.stack([cx + r * np.cos(a), cy + r * np.sin(a)], 1)


class Layer:
    """Supersampled drawing surface; coordinates are in output pixels."""

    def __init__(self, mode, fill):
        self.im = Image.new(mode, (W * SS, W * SS), fill)
        self.d = ImageDraw.Draw(self.im)

    @staticmethod
    def _xy(pts):
        return [(float(x) * SS, float(y) * SS) for x, y in pts]

    def line(self, pts, fill, width):
        self.d.line(self._xy(pts), fill=fill, width=max(1, int(round(width * SS))), joint="curve")

    def poly(self, pts, fill):
        self.d.polygon(self._xy(pts), fill=fill)

    def down(self):
        return self.im.resize((W, W), Image.LANCZOS)


class Embroidery:
    """Colour layer plus a group-id map (used to pick the stitch direction)."""

    def __init__(self):
        self.rgb = Layer("RGB", (0, 0, 0))
        self.gid = Layer("L", 0)

    def poly(self, pts, fill, gid):
        self.rgb.poly(pts, fill)
        self.gid.poly(pts, gid)

    def line(self, pts, fill, width, gid):
        self.rgb.line(pts, fill, width)
        self.gid.line(pts, gid, width)

    def outlined(self, pts, fill, gid, width=3.0):
        """Filled shape with a dark couched outline (pts already closed/wobbled)."""
        self.poly(pts, fill, gid)
        self.line(pts, DARK, width, gid)


# --------------------------------------------------------------------------
# neon meander borders
# --------------------------------------------------------------------------
def meander_side(o, h):
    """Polylines for the top side + top-left corner of a key-fret band."""
    cy = h / 5.0                       # cell size across the band
    avail = W - 2 * o - 2 * h
    n = max(1, round(avail / (5 * cy)))
    cx = avail / (5 * n)               # cell size along the band
    x0 = o + h + 0.5 * cx
    lines = []
    for i in range(n):
        u = x0 + i * 5 * cx

        def P(a, b):
            return (u + a * cx, o + b * cy)

        # square spiral rising from the inner rail
        lines.append([P(0, 5), P(0, 1), P(4, 1), P(4, 4), P(1, 4),
                      P(1, 2), P(3, 2), P(3, 3), P(2, 3)])
    # corner: nested squares
    m = h * 0.2
    lines.append([(o + m, o + m), (o + h - m, o + m), (o + h - m, o + h - m),
                  (o + m, o + h - m), (o + m, o + m)])
    m2 = h * 0.4
    lines.append([(o + m2, o + m2), (o + h - m2, o + m2), (o + h - m2, o + h - m2),
                  (o + m2, o + h - m2), (o + m2, o + m2)])
    return lines


def square(o):
    return [(o, o), (W - o, o), (W - o, W - o), (o, W - o), (o, o)]


# (offset, height, colour, width) — meander bands, outermost first
MEANDERS = [
    (22, 56, NEON_CYAN, 2.4),
    (110, 40, NEON_GOLD, 2.0),
    (172, 28, NEON_MAGENTA, 1.7),
]
# (offset, colour, width) — plain rails between the bands
RAILS = [
    (92, NEON_MAGENTA, 1.6), (99, NEON_MAGENTA, 1.6),
    (161, NEON_CYAN, 1.4),
    (208, NEON_GOLD, 1.6),
]


def neon_masks(rng):
    """One glow-ready mask per neon colour (so each can pulse on its own)."""
    groups = {}

    def layer(col):
        if col not in groups:
            groups[col] = Layer("L", 0)
        return groups[col]

    amp = 0.55
    for o, h, col, w in MEANDERS:
        L = layer(col)
        for ln in [square(o), square(o + h)]:
            L.line(wobble(ln, rng, amp, step=14), 255, w)
        side = meander_side(o, h)
        for k in range(4):
            for ln in side:
                L.line(wobble(rotate(ln, 90 * k), rng, amp), 255, w)
    for o, col, w in RAILS:
        layer(col).line(wobble(square(o), rng, amp, step=14), 255, w)
    # warm neon ring behind the bear, under the flame halo
    hx, hy = HALO_C
    layer(NEON_GOLD).line(wobble(circle_pts(hx, hy, 176, 140), rng, amp, closed=True), 255, 2.2)

    out = []
    for col, L in groups.items():
        m = L.down()
        core = np.asarray(m, np.float32) / 255
        g1 = np.asarray(m.filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
        g2 = np.asarray(m.filter(ImageFilter.GaussianBlur(12)), np.float32) / 255
        glow = (g1 * 1.6 + g2 * 1.8).astype(np.float32)
        out.append((np.array(col, np.float32) / 255, core, glow))
    return out


# --------------------------------------------------------------------------
# embroidered motifs
# --------------------------------------------------------------------------
def draw_waves(emb, rng):
    """Seigaiha (overlapping concentric scales) across the bottom of the panel."""
    x0, x1 = PANEL
    tmp = Embroidery()
    R = 30
    top = 742
    rings = [GOLD, TEAL_DARK, GOLD_LIGHT, TEAL, GOLD, TEAL_DARK]
    row = 0
    y = top
    while y - R < x1:
        off = R if row % 2 else 0
        x = x0 - 2 * R + off
        while x < x1 + 2 * R:
            jx, jy = rng.normal(0, 0.45, 2)
            for i, col in enumerate(rings):
                r = R * (1 - i / len(rings)) + rng.normal(0, 0.35)
                pts = wobble(circle_pts(x + jx, y + jy, r), rng, 0.45, closed=True)
                tmp.poly(pts, col, G_WAVE)
                if i == 0:
                    tmp.line(pts, DARK, 2.4, G_WAVE)
            x += 2 * R
        y += R * 0.55
        row += 1
    mask = Layer("L", 0)
    mask.poly([(x0, 0), (x1, 0), (x1, x1), (x0, x1)], 255)
    emb.rgb.im.paste(tmp.rgb.im, (0, 0), mask.im)
    emb.gid.im.paste(tmp.gid.im, (0, 0), mask.im)


ROCKS = [
    # central plateau the bear stands on
    [(452, 870), (460, 800), (468, 750), (484, 722), (516, 709), (560, 705),
     (596, 710), (614, 726), (622, 770), (630, 870)],
    # side peaks (left; right one is mirrored)
    [(272, 870), (280, 800), (290, 740), (306, 700), (318, 712), (330, 690),
     (344, 732), (352, 800), (358, 870)],
]


def draw_rocks(emb, rng):
    shapes = []
    for r in ROCKS:
        shapes.append(r)
        if r is not ROCKS[0]:
            shapes.append(mirror_x(r)[::-1])
    for pts in shapes:
        pts = wobble(pts, rng, 0.5, closed=True)
        tmp = Embroidery()
        tmp.poly(pts, GOLD_DEEP, G_ROCK)
        ys = np.asarray(pts)[:, 1]
        xs = np.asarray(pts)[:, 0]
        cols = [GOLD, TEAL, GOLD_LIGHT, TEAL_DARK]
        y = ys.min() + 10
        i = 0
        while y < ys.max():
            band = [(xs.min() - 5, y), (xs.max() + 5, y + 3)]
            line = wobble([(band[0][0], y), ((xs.min() + xs.max()) / 2, y - 6),
                           (band[1][0], y)], rng, 0.6)
            tmp.line(line, cols[i % len(cols)], 6, G_ROCK)
            tmp.line(line + (0, 5), DARK, 1.4, G_ROCK)
            y += 14
            i += 1
        clip = Layer("L", 0)
        clip.poly(pts, 255)
        emb.rgb.im.paste(tmp.rgb.im, (0, 0), clip.im)
        emb.gid.im.paste(tmp.gid.im, (0, 0), clip.im)
        emb.line(pts, DARK, 3.2, G_ROCK)
        emb.line(np.asarray(pts) + (0, 1.5), GOLD_LIGHT, 1.0, G_ROCK)


def flame_shape(L, w, curl):
    s = np.linspace(0, 1, 40)
    hw = w / 2 * np.sin(np.pi * np.clip(s * 1.6, 0, 0.5)) ** 0.5 * (1 - s) ** 0.9
    xc = curl * w * 0.45 * np.sin(np.pi * s) * s
    left = np.stack([xc - hw, -L * s], 1)
    right = np.stack([xc + hw, -L * s], 1)[::-1]
    return np.vstack([left, right])


def place(shape, x, y, deg):
    a = math.radians(deg)
    ca, sa = math.cos(a), math.sin(a)
    p = np.asarray(shape, float)
    return np.stack([p[:, 0] * ca - p[:, 1] * sa + x, p[:, 0] * sa + p[:, 1] * ca + y], 1)


def draw_flames(emb, rng):
    hx, hy = HALO_C
    r = 190
    angles = np.linspace(-205, 25, 13)  # degrees, screen space (y down)
    for i, a in enumerate(angles):
        rad = math.radians(a)
        x, y = hx + r * math.cos(rad), hy + r * math.sin(rad)
        rot = a + 90  # flame points away from the centre
        curl = -1 if x < hx else 1
        L = 64 + 10 * math.cos(i * 1.9)
        outer = place(flame_shape(L, 34, curl), x, y, rot)
        inner = place(flame_shape(L * 0.6, 17, curl), x, y + 0, rot)
        emb.outlined(wobble(outer, rng, 0.5, step=6, closed=True), FLAME_OUT, G_FLAME, 2.6)
        emb.poly(wobble(inner, rng, 0.5, step=6, closed=True), FLAME_IN, G_FLAME)
        # a little scroll curl at the base
        sp = spiral(x, y, 9, 2, 1.2, a + 180, direction=curl)
        emb.line(wobble(sp, rng, 0.35, step=4), DARK, 1.8, G_FLAME)


CLOUD = [  # (dx, dy, r) in cloud units
    (0, 0, 1.0), (-0.95, 0.3, 0.72), (0.95, 0.3, 0.72), (-0.45, -0.62, 0.6),
    (0.5, -0.66, 0.56), (0, 0.62, 0.58), (1.75, 0.62, 0.42), (2.35, 0.82, 0.28),
]


def draw_cloud(emb, rng, cx, cy, s, flip):
    sign = -1 if flip else 1
    circles = [(cx + sign * dx * s, cy + dy * s, r * s) for dx, dy, r in CLOUD]
    jit = [(x + rng.normal(0, 0.4), y + rng.normal(0, 0.4), r + rng.normal(0, 0.3))
           for x, y, r in circles]
    for x, y, r in jit:  # union outline: fat dark discs first
        emb.poly(wobble(circle_pts(x, y, r + 2.8), rng, 0.45, closed=True), DARK, G_CLOUD)
    for x, y, r in jit:
        emb.poly(wobble(circle_pts(x, y, r), rng, 0.45, closed=True), GOLD, G_CLOUD)
    for i, (x, y, r) in enumerate(jit):
        emb.poly(wobble(circle_pts(x - r * 0.12, y - r * 0.12, r * 0.62), rng, 0.4, closed=True),
                 GOLD_LIGHT, G_CLOUD)
        d = sign * (1 if i % 2 else -1)
        sp = spiral(x, y, r * 0.78, r * 0.08, 1.6, 200 if sign > 0 else -20, direction=d)
        emb.line(wobble(sp, rng, 0.4, step=5), DARK, 2.2, G_CLOUD)
        emb.line(wobble(sp * 0.995 + (0.6, 0.6), rng, 0.3, step=5), TEAL, 0.9, G_CLOUD)


def draw_scroll(emb, rng, x, y, s, flip):
    """Small S-shaped double curl."""
    sign = -1 if flip else 1
    a = spiral(x - sign * s * 0.6, y, s * 0.55, s * 0.08, 1.3, 90, direction=sign)
    b = spiral(x + sign * s * 0.6, y, s * 0.55, s * 0.08, 1.3, -90, direction=sign)
    body = np.vstack([a[::-1], b])
    emb.line(wobble(body, rng, 0.4, step=5), DARK, 6.0, G_CLOUD)
    emb.line(wobble(body, rng, 0.4, step=5), GOLD, 3.2, G_CLOUD)


def embroidery(rng):
    emb = Embroidery()
    draw_waves(emb, rng)
    draw_rocks(emb, rng)
    draw_flames(emb, rng)
    for flip in (False, True):
        mx = (lambda v: W - v) if flip else (lambda v: v)
        draw_cloud(emb, rng, mx(296), 284, 44, flip)
        draw_cloud(emb, rng, mx(262), 650, 26, flip)
        draw_scroll(emb, rng, mx(258), 450, 26, flip)
        draw_scroll(emb, rng, mx(430), 250, 18, flip)
    rgb = np.asarray(emb.rgb.down(), np.float32) / 255
    gid = np.asarray(emb.gid.im.resize((W, W), Image.NEAREST), np.uint8)
    return rgb, gid


# --------------------------------------------------------------------------
# frame assembly
# --------------------------------------------------------------------------
YY, XX = np.mgrid[0:W, 0:W].astype(np.float32)


def stitch_map(gid, phase):
    """Satin-stitch ripple following each group's stitch direction."""
    out = np.zeros((W, W), np.float32)
    for g, deg in STITCH_ANGLE.items():
        a = math.radians(deg)
        proj = XX * math.cos(a) + YY * math.sin(a)
        pat = 0.5 + 0.5 * np.sin(2 * math.pi * (proj / 3.4 + phase))
        out = np.where(gid == g, pat, out)
    return out


def silk(phase):
    tw = 0.5 + 0.5 * np.sin(2 * math.pi * ((XX + YY) / 4.0 + phase))
    r = np.hypot(XX - C, YY - C) / (W * 0.72)
    v = (0.022 + 0.014 * tw) * (1.1 - 0.5 * r ** 2)
    return np.stack([v * 0.8, v * 0.9, v * 1.35], -1)


def build_drawings():
    drawings = []
    for k in range(BOIL_DRAWINGS):
        rng = np.random.default_rng(1000 + k)
        rgb, gid = embroidery(rng)
        drawings.append({
            "rgb": rgb,
            "gid": gid,
            "stitch": stitch_map(gid, k * 0.17),
            "silk": silk(k * 0.25),
            "neon": neon_masks(rng),
        })
        print(f"boil drawing {k + 1}/{BOIL_DRAWINGS}")
    return drawings


RAD = np.hypot(XX - HALO_C[0], YY - HALO_C[1])
ANG = np.arctan2(YY - HALO_C[1], XX - HALO_C[0]) / (2 * math.pi)  # -0.5..0.5


def rainbow(h):
    """Vectorised fully-saturated hue -> RGB (h wraps at 1)."""
    h = (h % 1.0)[..., None]
    return np.clip(np.abs((h + np.array([0, 2 / 3, 1 / 3], np.float32)) % 1.0 * 6 - 3) - 1, 0, 1)


def shift(a, dx):
    return np.roll(a, int(round(dx)), axis=1)


def render_frame(d, f):
    # every time term below completes a whole number of cycles per loop
    t = f / N_FRAMES
    tau = 2 * math.pi
    rgb, gid, st = d["rgb"], d["gid"], d["stitch"]
    thread = gid > 0

    # --- psychedelic silk: rainbow rings + spinning rays radiating from the halo
    rings = 0.5 + 0.5 * np.sin(tau * (RAD / 46 - 3 * t))
    rays = 0.5 + 0.5 * np.sin(tau * (16 * ANG - 2 * t))
    rays2 = 0.5 + 0.5 * np.sin(tau * (-10 * ANG - 3 * t + RAD / 260))
    trip = (rings * (0.55 * rays + 0.45 * rays2)) ** 2.2
    fade = 0.3 + 0.9 * np.exp(-(RAD / 340) ** 2)
    bg_col = rainbow(RAD / 420 + ANG - 2 * t)
    silk = d["silk"] + (trip * fade)[..., None] * bg_col * 0.9

    # --- iridescent gold thread
    shade = 0.6 + 0.4 * st
    lum = rgb.mean(-1)
    irid = rainbow((XX * 0.7 + YY) / 380 + 0.15 * np.sin(tau * RAD / 300) - 2 * t)
    sweep = np.maximum(0, np.sin(tau * ((XX * 0.6 + YY * 0.8) / 540 - t))) ** 8
    sweep2 = np.maximum(0, np.sin(tau * ((XX * 0.8 - YY * 0.6) / 760 + 2 * t))) ** 12
    spec = (sweep * 0.8 + sweep2 * 0.5) * (0.35 + 0.65 * st) * lum
    warm = np.array([1.0, 0.88, 0.62], np.float32)
    emb = (rgb * shade[..., None]
           + (lum * st * 0.28)[..., None] * irid
           + spec[..., None] * (0.35 * warm + 0.9 * irid))

    out = np.where(thread[..., None], emb, silk)

    # --- neon: rainbow colour chasing round the borders, pulsing, with RGB split
    split = 3 + 2.5 * math.sin(tau * 2 * t)
    for i, (col, core, glow) in enumerate(d["neon"]):
        pulse = 0.7 + 0.3 * math.sin(tau * (4 * t + i * 0.27))
        hue = 2 * ANG + RAD / 320 - 2 * t + i / 3
        c = rainbow(hue) * 0.82 + col * 0.18
        g = np.stack([shift(glow, split), glow, shift(glow, -split)], -1)
        out = out + g * c * (0.7 * pulse)
        out = out + core[..., None] * (c * 0.55 + 0.45) * (0.85 + 0.15 * pulse)

    # --- bloom: blur the brightest parts back on top
    hot = np.clip(out - 0.55, 0, 1)
    hot = Image.fromarray((np.clip(hot, 0, 1) * 255).astype(np.uint8))
    bloom = np.asarray(hot.filter(ImageFilter.GaussianBlur(14)), np.float32) / 255
    out = out + bloom * (0.6 + 0.25 * math.sin(tau * 2 * t))

    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8))


def make_bear(src, dst):
    bear = Image.open(src).convert("RGBA")
    bear = bear.crop(bear.getchannel("A").getbbox())
    scale = BEAR_H / bear.height
    bear = bear.resize((round(bear.width * scale), BEAR_H), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    canvas.paste(bear, (round(C - bear.width / 2), BEAR_FEET_Y - BEAR_H), bear)
    canvas.save(dst)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", default=os.path.join(here, "out"))
    ap.add_argument("--bear", default=os.path.join(here, "assets", "kosukuma.png"))
    ap.add_argument("--frames", type=int, default=N_FRAMES,
                    help="render only the first N frames (for previews)")
    args = ap.parse_args()

    frames_dir = os.path.join(args.out, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    make_bear(args.bear, os.path.join(args.out, "kosukuma_cut.png"))

    drawings = build_drawings()
    for f in range(min(args.frames, N_FRAMES)):
        d = drawings[(f // BOIL_HOLD) % BOIL_DRAWINGS]
        render_frame(d, f).save(os.path.join(frames_dir, f"frame_{f:04d}.png"))
        if f % 12 == 0:
            print(f"frame {f}/{N_FRAMES}")


if __name__ == "__main__":
    main()
