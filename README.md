# Rounded Corners

The new MacBook Pro has rounded corners at the bottom of the screen, not just the top. This tiny app gives any screen that look: a smooth rounded corner in all four corners, on macOS and Windows.

- Click-through: everything under the corners works exactly as before
- No Dock / taskbar icon, just a small icon in the menu bar / system tray
- Starts automatically when you log in
- Works on every monitor, every Space/desktop and over fullscreen apps
- Hidden from screenshots, screen recordings and screen sharing

## Install

Download the latest `.dmg` (Mac) or `.exe` (Windows) from [Releases](../../releases).

**macOS:** the app isn't signed yet, so the first time right-click the app → **Open** → **Open**.
**Windows:** if SmartScreen shows up, click **More info** → **Run anyway**.

To quit or turn off launch at login, click the icon in the menu bar / system tray.

## Run from source

```bash
npm install
npm start
```

## Change the corner size

Open `src/main.js` and change `CORNER_SIZE` (default `24`) and `CORNER_COLOR`. The corner shape lives in `src/overlay.html` and `assets/corner.svg`.

## Build

```bash
npm run dist:mac   # → dist/*.dmg
npm run dist:win   # → dist/*.exe
```

Or push a tag (`git tag v1.0.0 && git push --tags`) and GitHub Actions builds both and publishes a Release.

## Note

On macOS the corners appear as soon as you log in. Nothing can draw on the boot or login screen without modifying the system, so this app doesn't try to.

## License

MIT
