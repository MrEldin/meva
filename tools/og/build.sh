#!/bin/bash
# Render the share card and install it as public/og-image.jpg.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$HERE/../.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --force-device-scale-factor=2 --virtual-time-budget=8000 \
  --screenshot="$HERE/card.png" "file://$HERE/card.html"

# Down from the 2x render, so the type stays crisp at card size.
sips -z 630 1200 -s format jpeg -s formatOptions 82 \
  "$HERE/card.png" --out "$ROOT/public/og-image.jpg" >/dev/null

rm -f "$HERE/card.png"
echo "og-image.jpg: $(wc -c < "$ROOT/public/og-image.jpg") bytes"
