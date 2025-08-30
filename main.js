const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
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
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

function setupDatabaseHandlers() {
  if (!db) return;

  // --- NEW IPC HANDLERS for Employee Performance ---
  ipcMain.handle('get-rep-performance', (event, { repId, month }) => {
    if (!repId) throw new Error('Sales Rep ID is required');
    if (!month) throw new Error('Month is required');
    return db.getRepPerformance(repId, month);
  });

  ipcMain.handle('set-rep-target', (event, { repId, month, targetAmount }) => {
    if (!repId) throw new Error('Sales Rep ID is required');
    if (!month) throw new Error('Month is required');
    if (targetAmount == null || isNaN(targetAmount)) throw new Error('Valid target amount is required');
    return db.setRepTarget(repId, month, targetAmount);
  });

  // --- Suppliers Handlers ---
  ipcMain.handle('get-all-suppliers', () => db.getAllSuppliers());
  ipcMain.handle('add-supplier', (event, supplier) => {
    if (!supplier.name?.trim()) throw new Error('Supplier name is required');
    if (!supplier.phone?.trim()) throw new Error('Supplier contact number is required');
    if (!supplier.address?.trim()) throw new Error('Supplier address is required');
    if (!supplier.gstin?.trim()) throw new Error('Supplier GSTIN is required');
    return db.addSupplier(supplier);
  });
  ipcMain.handle('update-supplier', (event, id, supplier) => {
    if (!id) throw new Error('Supplier ID is required for update');
    if (!supplier.name?.trim()) throw new Error('Supplier name is required');
    if (!supplier.phone?.trim()) throw new Error('Supplier contact number is required');
    if (!supplier.address?.trim()) throw new Error('Supplier address is required');
    if (!supplier.gstin?.trim()) throw new Error('Supplier GSTIN is required');
    return db.updateSupplier(id, supplier);
  });
  ipcMain.handle('delete-supplier', (event, id) => {
    if (!id) throw new Error('Supplier ID is required for deletion');
    return db.deleteSupplier(id);
  });

  // --- Parties Handlers ---
  ipcMain.handle('get-all-parties', () => db.getAllParties());
  ipcMain.handle('add-party', (event, party) => {
    if (!party.name?.trim()) throw new Error('Party name is required');
    if (!party.phone?.trim()) throw new Error('Party contact number is required');
    if (!party.address?.trim()) throw new Error('Party address is required');
    if (!party.gstin?.trim()) throw new Error('GSTIN is required');
    return db.addParty(party);
  });
  ipcMain.handle('update-party', (event, id, party) => {
    if (!id) throw new Error('Party ID is required for update');
    if (!party.name?.trim()) throw new Error('Party name is required');
    if (!party.phone?.trim()) throw new Error('Party contact number is required');
    if (!party.address?.trim()) throw new Error('Party address is required');
    if (!party.gstin?.trim()) throw new Error('GSTIN is required');
    return db.updateParty(id, party);
  });
  ipcMain.handle('delete-party', (event, id) => {
    if (!id) throw new Error('Party ID is required for deletion');
    return db.deleteParty(id);
  });
  ipcMain.handle('search-parties', (event, searchTerm) => db.searchParties(searchTerm));
  ipcMain.handle('get-party-by-name', (event, name) => db.getPartyByName(name));

  // --- Clients Handlers ---
  ipcMain.handle('get-all-clients', () => db.getAllClients());
  ipcMain.handle('add-client', (event, name) => {
    if (!name?.trim()) throw new Error('Client name is required');
    return db.addClient(name);
  });

  // --- Sales Reps ---
  ipcMain.handle('get-all-sales-reps', () => db.getAllSalesReps());
  ipcMain.handle('add-sales-rep', (event, employeeData) => {
    if (!employeeData.name?.trim()) throw new Error('Employee name is required');
    return db.addSalesRep(employeeData);
  });
  ipcMain.handle('delete-sales-rep', (event, id) => db.deleteSalesRep(id));

  // --- Medicines Handlers ---
  ipcMain.handle('get-all-medicines', () => db.getAllMedicines());
  ipcMain.handle('search-medicines', (event, searchTerm) => db.searchMedicines(searchTerm));
  ipcMain.handle('add-medicine', (event, medicine) => {
    if (!medicine.name?.trim() || medicine.price == null || medicine.stock == null) throw new Error('Medicine name, price, and stock are required');
    return db.addMedicine(medicine);
  });
  ipcMain.handle('update-medicine', (event, id, medicine) => {
    if (!id || !medicine.name?.trim() || medicine.price == null || medicine.stock == null) throw new Error('Medicine ID, name, price, and stock are required');
    return db.updateMedicine(id, medicine);
  });
  ipcMain.handle('delete-medicine', (event, id) => db.deleteMedicine(id));

  // --- Invoice Handlers ---
  ipcMain.handle('create-invoice', (event, invoiceData) => db.createInvoice(invoiceData));
  ipcMain.handle('get-filtered-invoices', (event, filters) => db.getFilteredInvoices(filters));
  ipcMain.handle('get-invoice-details', (event, invoiceId) => {
    if (!invoiceId) throw new Error('Invoice ID is required');
    return db.getInvoiceDetails(invoiceId);
  });

  // --- Export Handlers ---
  ipcMain.handle('export-invoices-csv', async (event, invoiceIds) => {
    if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices to export.' };
    const records = db.getInvoicesForExport(invoiceIds);
    if (!records || records.length === 0) return { success: false, message: 'No data for selected invoices.' };

    const headers = 'InvoiceNumber,Date,ClientName,SalesRep,ItemName,Quantity,FreeQuantity,UnitPrice,TotalPrice';
    const rows = records.map(r => 
      [`"${r.invoice_number}"`, `"${new Date(r.created_at).toLocaleDateString()}"`, `"${r.client_name}"`, `"${r.rep_name || 'N/A'}"`, `"${r.medicine_name}"`, r.quantity, r.free_quantity, r.unit_price, r.total_price].join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    const { filePath } = await dialog.showSaveDialog({ title: 'Export Sales to CSV', defaultPath: `sales-export.csv`, filters: [{ name: 'CSV Files', extensions: ['csv'] }] });
    if (filePath) {
      try {
        fs.writeFileSync(filePath, csvContent);
        return { success: true, path: filePath };
      } catch (error) { return { success: false, message: error.message }; }
    }
    return { success: false, message: 'Save cancelled.' };
  });

  ipcMain.handle('export-invoices-xlsx', async (event, invoiceIds) => {
    if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices to export.' };
    const records = db.getInvoicesForExport(invoiceIds);
    if (!records || records.length === 0) return { success: false, message: 'No data for selected invoices.' };
    
    const { filePath } = await dialog.showSaveDialog({ title: 'Export Sales to Excel', defaultPath: `sales-export.xlsx`, filters: [{ name: 'Excel Files', extensions: ['xlsx'] }] });
    if (!filePath) return { success: false, message: 'Save cancelled.' };

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Export');
      worksheet.columns = [
        { header: 'Invoice Number', key: 'invoice_number', width: 20 }, { header: 'Date', key: 'created_at', width: 15 },
        { header: 'Client Name', key: 'client_name', width: 30 }, { header: 'Sales Rep', key: 'rep_name', width: 20 },
        { header: 'Item Name', key: 'medicine_name', width: 30 }, { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Free Quantity', key: 'free_quantity', width: 15 }, { header: 'Unit Price', key: 'unit_price', width: 15, style: { numFmt: '"₹"#,##0.00' } },
        { header: 'Total Price', key: 'total_price', width: 15, style: { numFmt: '"₹"#,##0.00' } }
      ];
      records.forEach(record => worksheet.addRow(record));
      await workbook.xlsx.writeFile(filePath);
      return { success: true, path: filePath };
    } catch (error) { return { success: false, message: error.message }; }
  });

  // --- Misc ---
  ipcMain.handle('get-all-invoices', () => db.getAllInvoices?.() || []);
  ipcMain.handle('generate-invoice-number', () => db.generateInvoiceNumber());
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

