#!/usr/bin/env bash
# Ricostruisce un video a frame rate costante dai frame dello screencast e lo
# esporta per TikTok / WhatsApp / Windows: H.264 High, yuv420p, CRF 18, preset slow,
# BT.709, AAC stereo muto, faststart.
set -euo pipefail
cd "$(dirname "$0")/.."
FPS="${FPS:-30}"
OUT="${OUT:-out/limitless-analisi.mp4}"
DUR=$(node -e "const s=require('fs').readFileSync('build/frames.ffconcat','utf8');let d=0;for(const m of s.matchAll(/duration ([\d.]+)/g))d+=+m[1];console.log(d.toFixed(3))")
GRAIN="${GRAIN:-0.22}"   # intensità grana statica anti-banding (0 = off)
mkdir -p "$(dirname "$OUT")"

# Grana statica (un solo frame di rumore riusato per tutto il video): fa da dithering
# sui gradienti scuri, che in H.264 8 bit altrimenti diventano anelli visibili.
# Essendo fissa non crea flicker e costa pochissimo bitrate.
[ -f build/grain.png ] || ffmpeg -v error -y -f lavfi -i "color=c=0x808080:s=1080x1920:d=1,format=gray,noise=alls=70:allf=u" -frames:v 1 build/grain.png

ffmpeg -hide_banner -loglevel warning -y \
  -f concat -safe 0 -i build/frames.ffconcat \
  -loop 1 -framerate "$FPS" -i build/grain.png \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -filter_complex "[0:v]fps=${FPS}:round=near,scale=1080:1920:flags=lanczos,format=gbrp[v];[1:v]format=gbrp[g];[v][g]blend=all_mode=overlay:all_opacity=${GRAIN}:shortest=1,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[out]" \
  -map "[out]" -map 2:a \
  -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 18 -pix_fmt yuv420p \
  -x264-params aq-mode=3 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -r "$FPS" -g $((FPS * 2)) \
  -c:a aac -b:a 128k -ar 48000 -ac 2 \
  -t "$DUR" -movflags +faststart \
  "$OUT"

echo "→ $OUT ($(du -h "$OUT" | cut -f1), ${DUR}s @ ${FPS}fps)"
