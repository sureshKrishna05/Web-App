const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DatabaseService = require('./src/database/database');

let db;

const isDev = !app.isPackaged; // true if running `npm run dev`

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // Point Electron to Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // Load built app
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

function setupDatabaseHandlers() {
  if (!db) return;

  // --- Medicine Handlers ---
  ipcMain.handle('get-all-medicines', () => db.getAllMedicines());
  ipcMain.handle('search-medicines', (event, searchTerm) => db.searchMedicines(searchTerm));
  ipcMain.handle('add-medicine', (event, medicine) => db.addMedicine(medicine));
  ipcMain.handle('update-medicine', (event, id, medicine) => db.updateMedicine(id, medicine));
  ipcMain.handle('delete-medicine', (event, id) => db.deleteMedicine(id));

  // --- Invoice Handlers ---
  ipcMain.handle('create-invoice', (event, invoiceData) => db.createInvoice(invoiceData));
  ipcMain.handle('get-all-invoices', () => db.getAllInvoices());
  ipcMain.handle('generate-invoice-number', () => db.generateInvoiceNumber());

  // --- Dashboard Handlers ---
  ipcMain.handle('get-dashboard-stats', () => db.getDashboardStats());
}

app.whenReady().then(() => {
  db = new DatabaseService();
  setupDatabaseHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});
