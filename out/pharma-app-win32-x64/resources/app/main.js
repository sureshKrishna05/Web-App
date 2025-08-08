const { app, BrowserWindow } = require('electron');
const path = require('path');

// This special variable is provided by the @electron-forge/plugin-vite package.
// It holds the URL of the Vite development server.
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // In development, load the Vite server URL.
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // Open the DevTools automatically for debugging.
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file.
    // The path is relative to the location of the packaged app.
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'main_window', 'index.html'));
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
