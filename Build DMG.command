#!/bin/bash
# Double-click to build the same .dmg that GitHub will publish. Result: dist/*.dmg
cd "$(dirname "$0")"
export PATH="$PWD/.node/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
[ -d node_modules/electron-builder ] || npm install --no-audit --no-fund
echo "Building the .dmg (takes a few minutes the first time)..."
npx electron-builder --mac dmg || { echo "Build failed"; read -n1; exit 1; }
open dist
echo ""
echo "Done! The .dmg is in the dist folder that just opened."
