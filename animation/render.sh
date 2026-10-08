#!/usr/bin/env bash
# Render the mandarin-square bear loop.
#   1. generate.py  -> out/frames/frame_%04d.png + out/kosukuma_cut.png
#   2. frames       -> out/boil.mp4   (background line-boil loop)
#   3. boil + bear  -> out/x_loop.mp4 (final 1080x1080, 36 fps)
set -euo pipefail
cd "$(dirname "$0")"

python3 generate.py --out out

cd out
ffmpeg -y -framerate 36 -i frames/frame_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart boil.mp4

ffmpeg -y -i boil.mp4 -loop 1 -i kosukuma_cut.png -filter_complex "[0][1]overlay=0:0:shortest=1,scale=1080:1080:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -crf 18 -r 36 -movflags +faststart x_loop.mp4
