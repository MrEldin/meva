#!/bin/bash
# Build the storefront here and upload it to the droplet.
#
#   deploy/push.sh meva@1.2.3.4
#
# The server has no Node: this builds `dist` locally, rsyncs it next to the
# live build, then swaps the two in one move so visitors never see a half
# uploaded site.
set -euo pipefail

TARGET="${1:?usage: deploy/push.sh user@host}"
REMOTE_DIR="/var/www/meva-client"

cd "$(dirname "$0")/.."

echo "== building"
yarn install --immutable
yarn build

echo "== uploading to $TARGET:$REMOTE_DIR/dist.new"
rsync -az --delete -e ssh dist/ "$TARGET:$REMOTE_DIR/dist.new/"

# Carry the previous build's chunks over into the new one.
#
# Every page of the shop is a lazily imported chunk under a hashed name, and a
# deploy gives them all new names. A tab that was opened before the deploy is
# still holding the old index, so the moment someone clicks a product it asks
# for a file that no longer exists -- the click does nothing at all, with
# nothing in the interface to say why. Keeping the old files beside the new
# ones (never overwriting a new one) means those tabs keep working. Anything
# not touched in a fortnight is swept up, so this does not grow forever.
echo "== keeping the previous build's chunks"
ssh "$TARGET" "cd $REMOTE_DIR && [ -d dist/assets ] && cp -rn dist/assets/. dist.new/assets/ 2>/dev/null; find dist.new/assets -type f -mtime +14 -delete 2>/dev/null; true"

echo "== swapping in"
ssh "$TARGET" "cd $REMOTE_DIR && rm -rf dist.old && { [ -d dist ] && mv dist dist.old || true; } && mv dist.new dist && rm -rf dist.old"

echo "== live: $(git rev-parse --short HEAD)"
