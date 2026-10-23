#!/usr/bin/env bash
# Uso: bash tools/encode.sh <nome> [titolo-file]
# Esporta per TikTok/Instagram: H.264 High 4.1, yuv420p, CRF 18, preset slow, BT.709, AAC muto, faststart.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="$1"; OUT="out/${2:-$NAME}.mp4"; FPS="${FPS:-30}"; GRAIN="${GRAIN:-0.2}"
mkdir -p out build
[ -f build/grain.png ] || ffmpeg -v error -y -f lavfi -i "color=c=0x808080:s=1080x1920:d=1,format=gray,noise=alls=70:allf=u" -frames:v 1 build/grain.png
ffmpeg -hide_banner -loglevel warning -y \
  -framerate "$FPS" -i "build/$NAME/f%05d.png" \
  -loop 1 -framerate "$FPS" -i build/grain.png \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -filter_complex "[0:v]format=gbrp[v];[1:v]format=gbrp[g];[v][g]blend=all_mode=overlay:all_opacity=${GRAIN}:shortest=1,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[out]" \
  -map "[out]" -map 2:a -shortest \
  -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 18 -pix_fmt yuv420p -x264-params aq-mode=3 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -r "$FPS" -g $((FPS * 2)) -c:a aac -b:a 128k -ar 48000 -ac 2 -movflags +faststart "$OUT"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,pix_fmt,codec_name:format=duration -of default=nw=1 "$OUT" | tr '\n' ' '; echo
echo "→ $OUT ($(du -h "$OUT" | cut -f1))"
