#!/bin/bash
# Double-click to build Rounded Corners.app, copy it to /Applications and start it.
cd "$(dirname "$0")"
export PATH="$PWD/.node/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
export CSC_IDENTITY_AUTO_DISCOVERY=false

echo "Stopping the test version (if running)..."
pkill -f "rounded-corners/node_modules/electron" 2>/dev/null
pkill -x "Rounded Corners" 2>/dev/null
sleep 1

[ -d node_modules/electron-builder ] || npm install --no-audit --no-fund

ARCH=$(uname -m); [ "$ARCH" = "x86_64" ] && ARCH=x64
echo "Building the app (takes a minute)..."
npx electron-builder --mac dir --$ARCH || { echo "Build failed"; read -n1; exit 1; }

APP=$(ls -d dist/mac*/"Rounded Corners.app" | head -1)
codesign --force --deep --sign - "$APP"

echo "Installing to /Applications..."
rm -rf "/Applications/Rounded Corners.app"
ditto "$APP" "/Applications/Rounded Corners.app"
xattr -dr com.apple.quarantine "/Applications/Rounded Corners.app" 2>/dev/null

open "/Applications/Rounded Corners.app"
echo ""
echo "Done! Rounded Corners is in your Applications folder and starts at login."
echo "You can close this window."
