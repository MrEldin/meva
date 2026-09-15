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

echo "== swapping in"
ssh "$TARGET" "cd $REMOTE_DIR && rm -rf dist.old && { [ -d dist ] && mv dist dist.old || true; } && mv dist.new dist && rm -rf dist.old"

echo "== live: $(git rev-parse --short HEAD)"
