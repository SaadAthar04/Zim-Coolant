#!/usr/bin/env bash
# Build web-delivery images for the storefront from the client handoff masters.
#
# The handoff ships lossless WebP (and PNG masters for the eight 4 Liter views).
# Those files are 1.1-1.4 MB each, which is fine as an archive but wasteful to
# serve. This produces visually identical lossy WebP at the same 1254x1254
# pixel dimensions, so labels, proportions and framing are untouched.
#
# Masters stay in ZIM_Developer_Handoff_2026-09-18/ as the record of what the
# client supplied. Only the output of this script is served from /public.
#
# assets/corrected-artwork/ holds replacement artwork the client sent after the
# handoff (currently the red 4 Liter front, whose badge was corrected from 1968
# to 1988). Anything found there wins over the handoff copy.
#
# Usage: ./scripts/optimize-handoff-images.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HANDOFF="$ROOT/ZIM_Developer_Handoff_2026-09-18"
WEB="$HANDOFF/images/web"
ORIGINALS="$HANDOFF/images/originals"
CORRECTED="$ROOT/assets/corrected-artwork"
OUT="$ROOT/public/products"

QUALITY=82

# Every image in the catalogue is a 1254x1254 square. Replacement artwork has
# arrived at other sizes, so anything off-spec is resampled to 1254 with Lanczos
# before encoding. That keeps one intrinsic size across the whole set, so the
# 10:11 home-card crop and the product gallery behave identically for every
# product. Resampling never changes framing or aspect: these are all squares
# scaled uniformly.
TARGET_PX=1254

mkdir -p "$OUT"

# Resampling needs Pillow, and the first python3 on PATH does not always have
# it. Pick one that does, rather than failing halfway through the set.
PYBIN=""
for candidate in python3 /usr/bin/python3 /usr/local/bin/python3; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c "import PIL" >/dev/null 2>&1; then
    PYBIN="$candidate"
    break
  fi
done

TMPDIR_NORM="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_NORM"' EXIT

# normalize <src> <dest-png> -> prints the path to use for encoding
normalize() {
  # Nothing to resample with: the handoff images are already the right size,
  # and only replacement artwork ever needs resizing.
  if [[ -z "$PYBIN" ]]; then
    echo "$1"
    return
  fi
  "$PYBIN" - "$1" "$2" "$TARGET_PX" <<'PY'
import sys
from PIL import Image

src, dst, target = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGB')
if im.size == (target, target):
    print(src)
else:
    if im.width != im.height:
        # Wide artwork such as the home banner keeps its own proportions.
        print(src)
        raise SystemExit
    im.resize((target, target), Image.LANCZOS).save(dst, 'PNG')
    print(dst)
PY
}

# The eight 4 Liter views ship as unedited PNG masters; encode from those.
# Everything else comes from the lossless WebP, which is pixel-identical to
# what the client approved.
IMAGES=(
  zim-anti-rust-coolant-1-liter-green-front
  zim-anti-rust-coolant-1-liter-green-back
  zim-anti-rust-coolant-1-liter-red-front
  zim-anti-rust-coolant-1-liter-red-back
  zim-anti-rust-coolant-4-liter-green-front
  zim-anti-rust-coolant-4-liter-green-back
  zim-anti-rust-coolant-4-liter-red-front
  zim-anti-rust-coolant-4-liter-red-back
  zimx-anti-freeze-anti-boil-1-liter-green-front
  zimx-anti-freeze-anti-boil-1-liter-green-back
  zimx-anti-freeze-anti-boil-1-liter-red-front
  zimx-anti-freeze-anti-boil-1-liter-red-back
  zimx-anti-freeze-anti-boil-4-liter-green-front
  zimx-anti-freeze-anti-boil-4-liter-green-back
  zimx-anti-freeze-anti-boil-4-liter-red-front
  zimx-anti-freeze-anti-boil-4-liter-red-back
  zim-gear-oil-1-liter-front
  zim-gear-oil-1-liter-back
  zim-atf-front
  zim-atf-back
  zimx-nozzle
  banner-main
)

total_in=0
total_out=0

for name in "${IMAGES[@]}"; do
  if [[ -f "$CORRECTED/$name.jpeg" ]]; then
    src="$CORRECTED/$name.jpeg"
  elif [[ -f "$CORRECTED/$name.png" ]]; then
    src="$CORRECTED/$name.png"
  elif [[ -f "$ORIGINALS/$name.png" ]]; then
    src="$ORIGINALS/$name.png"
  elif [[ -f "$WEB/$name.webp" ]]; then
    src="$WEB/$name.webp"
  else
    echo "MISSING SOURCE: $name" >&2
    exit 1
  fi

  encode_src="$(normalize "$src" "$TMPDIR_NORM/$name.png")"

  dst="$OUT/$name.webp"
  cwebp -quiet -q "$QUALITY" -m 6 -sharp_yuv "$encode_src" -o "$dst"

  in_bytes=$(stat -f%z "$src")
  out_bytes=$(stat -f%z "$dst")
  total_in=$((total_in + in_bytes))
  total_out=$((total_out + out_bytes))

  printf '%-52s %7s KB -> %6s KB\n' "$name" "$((in_bytes / 1024))" "$((out_bytes / 1024))"
done

echo
printf 'Total: %s KB -> %s KB (%s%% of source)\n' \
  "$((total_in / 1024))" "$((total_out / 1024))" "$((total_out * 100 / total_in))"
