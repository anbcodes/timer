// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, ipcMain } = require('electron');

module.exports = function createApp() {
  const windows = { settings: null, frame: null };

  function createSettingsWindow() {
    if (windows.settings) return;
    windows.settings = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        additionalArguments: ['settings'],
      },
    });

    windows.settings.loadFile('dist/index.html');

    // windows.settings.webContents.openDevTools();

    windows.settings.on('closed', () => {
      windows.settings = null;
    });
  }

  ipcMain.handle('openSettings', () => {
    createSettingsWindow();
    windows.settings.focus();
  });

  function createFrameWindow() {
    if (windows.frame) return;
    windows.frame = new BrowserWindow({
      width: 200,
      // width: 1400,
      x: 0,
      y: 0,
      height: 90,
      // height: 500,
      webPreferences: {
        nodeIntegration: true,
        additionalArguments: ['frame'],
      },
      frame: false,
      alwaysOnTop: true,
      transparent: true,
    });

    windows.frame.setAlwaysOnTop(true, 'floating');
    windows.frame.setVisibleOnAllWorkspaces(true);
    windows.frame.setFullScreenable(false);

    windows.frame.loadFile('dist/index.html');

    windows.frame.on('closed', () => {
      windows.frame = null;
    });
  }

  ipcMain.handle('createFrame', () => {
    createFrameWindow();
  });

  function createWindows() {
    createFrameWindow();
    createSettingsWindow();
  }

  // setTimeout is used so that transparency is ready when we open the window.
  app.whenReady().then(() => setTimeout(createWindows, 500));

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows();
    }
  });

  return windows;
};
