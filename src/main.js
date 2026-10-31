const { app, BrowserWindow, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// Corner size in pixels on the built-in laptop screen.
const CORNER_SIZE = 24;
// Corner size on external monitors (their pixels are physically bigger than a laptop panel, so a smaller number).
const CORNER_SIZE_EXTERNAL = 16;
// Corner color. Use something bright like '#00C853' to check alignment, '#000' for real use.
const CORNER_COLOR = '#000';

const isMac = process.platform === 'darwin';
let windows = [];
let tray = null;

// Only one copy of the app can run at a time.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// macOS clips window corners with its own rounding, so each corner window
// extends PAD px past the screen edges. Its clipped corner ends up off-screen,
// and the corner shape is drawn exactly at the screen corner.
const PAD = 40;

// One small window per corner, placed in that corner of the display.
function cornerSize(display) {
  return display.internal ? CORNER_SIZE : CORNER_SIZE_EXTERNAL;
}

function cornerBounds(display, corner) {
  const { x, y, width, height } = display.bounds;
  const size = cornerSize(display);
  const s = size + PAD;
  return {
    x: corner.endsWith('l') ? x - PAD : x + width - size,
    y: corner.startsWith('t') ? y - PAD : y + height - size,
    width: s,
    height: s,
  };
}

function createCorner(display, corner) {
  const bounds = cornerBounds(display, corner);

  const win = new BrowserWindow({
    ...bounds,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    fullscreenable: false,
    enableLargerThanScreen: true,
    roundedCorners: false, // macOS rounds window corners by default, which would clip the corner shape
    backgroundColor: '#00000000',
    ...(isMac ? { type: 'panel' } : { type: 'toolbar' }),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // Clicks go straight through to whatever is underneath.
  win.setIgnoreMouseEvents(true);
  // Stay above everything, including the menu bar / taskbar.
  win.setAlwaysOnTop(true, 'screen-saver');
  // Visible on every Space / desktop and over fullscreen apps.
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Hidden from screenshots, screen recordings and screen sharing.
  win.setContentProtection(true);

  win.loadFile(path.join(__dirname, 'overlay.html'), {
    query: { corner, color: CORNER_COLOR, size: String(cornerSize(display)), pad: String(PAD) },
  });

  win.once('ready-to-show', () => {
    win.setBounds(bounds); // re-apply in case the OS nudged the window (e.g. under the menu bar)
    win.showInactive();
  });

  return win;
}

function rebuild() {
  windows.forEach((w) => !w.isDestroyed() && w.destroy());
  windows = [];
  for (const display of screen.getAllDisplays()) {
    for (const corner of ['tl', 'tr', 'bl', 'br']) {
      windows.push(createCorner(display, corner));
    }
  }
}

let rebuildTimer = null;
function scheduleRebuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuild, 300);
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'trayTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  if (isMac) icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Rounded Corners');

  const buildMenu = () =>
    Menu.buildFromTemplate([
      {
        label: 'Launch at login',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked }),
      },
      { type: 'separator' },
      { label: 'Quit Rounded Corners', click: () => app.quit() },
    ]);

  tray.setContextMenu(buildMenu());
  tray.on('click', () => tray.setContextMenu(buildMenu()));
}

app.whenReady().then(() => {
  if (isMac && app.dock) app.dock.hide();

  // Turn on "launch at login" the first time the app runs.
  if (!app.getLoginItemSettings().openAtLogin && !process.env.RC_NO_AUTOSTART) {
    app.setLoginItemSettings({ openAtLogin: true });
  }

  rebuild();
  createTray();

  screen.on('display-added', scheduleRebuild);
  screen.on('display-removed', scheduleRebuild);
  screen.on('display-metrics-changed', scheduleRebuild);
});

// No windows of our own ever "close", but keep the app alive regardless.
app.on('window-all-closed', (e) => e.preventDefault());
