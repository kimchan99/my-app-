# Mandarin-square bear loop

`./render.sh` produces `out/x_loop.mp4`: a 1080×1080, 36 fps, 4 s seamless loop of the
bear standing in an embroidered mandarin-square rank badge.

- `generate.py` procedurally draws the badge: three nested neon meander (key-fret)
  borders on black silk, gold-thread ruyi clouds and scrolls, a flame halo, striped
  rocks and seigaiha waves. Every line is redrawn with a small random wobble
  (4 drawings × 3 frames = line boil at 12 drawings/s). The gold thread has a sweeping
  iridescent rainbow shimmer, the neon borders cycle through rainbow colours with an RGB split and bloom, and rainbow rings and rays swirl behind the bear. Everything repeats exactly every 144 frames.
- `generate.py` also writes `out/kosukuma_cut.png`: `assets/kosukuma.png` scaled and placed on a
  transparent 1080² canvas, standing on the central rock, ready for `overlay=0:0`.
- `render.sh` runs the two ffmpeg passes (frames → `boil.mp4`, `boil.mp4` + bear → `x_loop.mp4`).

Tweak the layout, colours, `N_FRAMES`, `BOIL_HOLD` and `BOIL_DRAWINGS` at the top of `generate.py`.
`python3 generate.py --frames 1 --out /tmp/preview` renders a quick single-frame preview.
Requires Python 3 with Pillow + NumPy, and ffmpeg with libx264.
