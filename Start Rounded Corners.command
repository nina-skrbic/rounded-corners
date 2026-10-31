#!/bin/bash
# Double-click to install dependencies (first time) and start Rounded Corners.
cd "$(dirname "$0")"
export PATH="$PWD/.node/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found — downloading a local copy into this folder..."
  ARCH=$(uname -m); [ "$ARCH" = "x86_64" ] && ARCH=x64
  FILE=$(curl -fsSL https://nodejs.org/dist/latest-v22.x/ | grep -o "node-v22[0-9.]*-darwin-$ARCH.tar.gz" | head -1)
  mkdir -p .node && curl -fsSL "https://nodejs.org/dist/latest-v22.x/$FILE" | tar xz -C .node --strip-components=1
fi

echo "Node $(node -v)"
if [ ! -d node_modules/electron/dist ]; then
  echo "Installing (first time only, takes a minute)..."
  npm install --no-audit --no-fund || { echo "Install failed"; read -n1; exit 1; }
fi

echo "Starting Rounded Corners. Close this window or press Ctrl+C to stop."
RC_NO_AUTOSTART=1 npm start
