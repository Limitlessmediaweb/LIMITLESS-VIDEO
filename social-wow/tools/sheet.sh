#!/usr/bin/env bash
# Contact sheet: un frame al secondo, con le safe zone in rosso. Uso: bash tools/sheet.sh <nome>
set -euo pipefail; cd "$(dirname "$0")/.."
NAME="$1"; FPS="${FPS:-30}"
ffmpeg -hide_banner -loglevel error -y -framerate "$FPS" -i "build/$NAME/f%05d.png" \
  -vf "select='not(mod(n-15\,${FPS}))',drawbox=0:0:1080:150:red@0.35:t=fill,drawbox=0:1540:1080:380:red@0.35:t=fill,drawbox=940:150:140:1390:red@0.35:t=fill,scale=270:480,tile=6x5:padding=4:color=0x222222" \
  -frames:v 1 "out/${NAME}-sheet.jpg"
echo "→ out/${NAME}-sheet.jpg"
