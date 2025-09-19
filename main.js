const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const ExcelJS = require('exceljs');
const DatabaseService = require('./src/database/database');
const { createInvoice, createQuotation } = require('./src/utils/invoiceGenerator');

// --- Global Variables ---
let db;
let mainWindow;
let printWindow; // Hidden window for silent printing

const isDev = !app.isPackaged;

// --- Window Management ---

/**
 * Creates the main application window and the hidden print window.
 */
function createWindows() {
  // Main window configuration
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Hidden window for handling print operations without disturbing the user.
  printWindow = new BrowserWindow({ show: false });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}


// --- IPC Handlers Setup ---

/**
 * Sets up IPC handlers related to PDF generation, printing, and downloading.
 */
function setupPdfHandlers() {
  if (!db) return;

  // Handler for printing Invoices or Quotations
  ipcMain.handle('print-pdf', async (event, pdfData, type = 'invoice') => {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `print-${Date.now()}.pdf`);

    try {
      if (type === 'invoice') {
        await createInvoice(pdfData, tempFilePath);
      } else if (type === 'quotation') {
        await createQuotation(pdfData, tempFilePath);
      } else {
        throw new Error(`Invalid document type for printing: ${type}`);
      }

      await printWindow.loadFile(tempFilePath);

      printWindow.webContents.once('did-finish-load', () => {
        printWindow.webContents.print({ silent: false, printBackground: true }, (success, reason) => {
          if (!success) console.error('Printing failed:', reason);
          
          // Cleanup the temporary file after printing is done.
          fs.unlink(tempFilePath, (err) => {
            if (err) console.error('Failed to delete temporary PDF:', err);
          });
        });
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to create or print PDF:', error);
      return { success: false, message: error.message };
    }
  });

  // Handler for downloading an existing Invoice as a PDF
  ipcMain.handle('download-invoice-pdf', async (event, invoiceId) => {
    try {
      const invoiceDetails = db.getInvoiceDetails(invoiceId);
      if (!invoiceDetails) return { success: false, message: 'Invoice not found.' };

      const clientDetails = db.getPartyById(invoiceDetails.client_id);
      if (!clientDetails) return { success: false, message: 'Client details not found for this invoice.' };

      const pdfData = {
        invoiceNumber: invoiceDetails.invoice_number,
        paymentMode: invoiceDetails.payment_mode || 'N/A',
        client: clientDetails,
        billItems: invoiceDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
        totals: {
          subtotal: invoiceDetails.total_amount,
          tax: invoiceDetails.tax,
          finalAmount: invoiceDetails.final_amount
        }
      };

      const { filePath } = await dialog.showSaveDialog({
        title: 'Download Invoice PDF',
        defaultPath: `invoice-${pdfData.invoiceNumber}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (filePath) {
        await createInvoice(pdfData, filePath);
        return { success: true, path: filePath };
      }
      return { success: false, message: 'Save cancelled.' };
    } catch (error) {
      console.error('Failed to download invoice PDF:', error);
      return { success: false, message: error.message };
    }
  });
  
  // Handler for downloading an existing Quotation as a PDF
  ipcMain.handle('download-quotation-pdf', async (event, quotationId) => {
    try {
        const quotationDetails = db.getQuotationDetails(quotationId);
        if (!quotationDetails) return { success: false, message: 'Quotation not found.' };

        const clientDetails = db.getPartyById(quotationDetails.client_id);
        if (!clientDetails) return { success: false, message: 'Client details not found for this quotation.' };

        const pdfData = {
            quotationNumber: quotationDetails.quotation_number,
            client: clientDetails,
            billItems: quotationDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
            totals: {
                subtotal: quotationDetails.total_amount,
                tax: quotationDetails.tax,
                finalAmount: quotationDetails.final_amount
            }
        };

        const { filePath } = await dialog.showSaveDialog({
            title: 'Download Quotation PDF',
            defaultPath: `quotation-${pdfData.quotationNumber}.pdf`,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });

        if (filePath) {
            await createQuotation(pdfData, filePath);
            return { success: true, path: filePath };
        }
        return { success: false, message: 'Save cancelled.' };
    } catch (error) {
        console.error('Failed to download quotation PDF:', error);
        return { success: false, message: error.message };
    }
  });
}

/**
 * Sets up IPC handlers for managing Suppliers.
 */
function setupSupplierHandlers() {
    if (!db) return;
    ipcMain.handle('get-all-suppliers', () => db.getAllSuppliers());
    ipcMain.handle('add-supplier', (event, supplier) => db.addSupplier(supplier));
    ipcMain.handle('update-supplier', (event, id, supplier) => db.updateSupplier(id, supplier));
    ipcMain.handle('delete-supplier', (event, id) => db.deleteSupplier(id));
}

/**
 * Sets up IPC handlers for managing Parties (Clients).
 */
function setupPartyHandlers() {
    if (!db) return;
    ipcMain.handle('get-all-parties', () => db.getAllParties());
    ipcMain.handle('get-party-by-id', (event, id) => db.getPartyById(id));
    ipcMain.handle('add-party', (event, party) => db.addParty(party));
    ipcMain.handle('update-party', (event, id, party) => db.updateParty(id, party));
    ipcMain.handle('delete-party', (event, id) => db.deleteParty(id));
    ipcMain.handle('search-parties', (event, searchTerm) => db.searchParties(searchTerm));
    ipcMain.handle('get-party-by-name', (event, name) => db.getPartyByName(name));
}

/**
 * Sets up IPC handlers for managing Sales Representatives.
 */
function setupSalesRepHandlers() {
    if (!db) return;
    ipcMain.handle('get-all-sales-reps', () => db.getAllSalesReps());
    ipcMain.handle('add-sales-rep', (event, employeeData) => db.addSalesRep(employeeData));
    ipcMain.handle('delete-sales-rep', (event, id) => db.deleteSalesRep(id));
    ipcMain.handle('get-rep-performance', (event, { repId, month }) => db.getRepPerformance(repId, month));
    ipcMain.handle('set-rep-target', (event, { repId, month, targetAmount }) => db.setRepTarget(repId, month, targetAmount));
}

/**
 * Sets up IPC handlers for managing Medicines.
 */
function setupMedicineHandlers() {
    if (!db) return;
    ipcMain.handle('get-all-medicines', () => db.getAllMedicines());
    ipcMain.handle('search-medicines', (event, searchTerm) => db.searchMedicines(searchTerm));
    ipcMain.handle('add-medicine', (event, medicine) => db.addMedicine(medicine));
    ipcMain.handle('update-medicine', (event, id, medicine) => db.updateMedicine(id, medicine));
    ipcMain.handle('delete-medicine', (event, id) => db.deleteMedicine(id));
}

/**
 * Sets up IPC handlers for managing HSN/GST Groups.
 */
function setupGroupHandlers() {
    if (!db) return;
    ipcMain.handle('get-all-groups', () => db.getAllGroups());
    ipcMain.handle('get-group-details', (event, id) => db.getGroupDetails(id));
    ipcMain.handle('add-group', (event, group) => db.addGroup(group));
    ipcMain.handle('update-group-gst', (event, { id, gst_percentage }) => db.updateGroupGst(id, gst_percentage));
    ipcMain.handle('delete-group', (event, id) => db.deleteGroup(id));
}

/**
 * Sets up IPC handlers for managing Invoices.
 */
function setupInvoiceHandlers() {
    if (!db) return;
    ipcMain.handle('create-invoice', (event, invoiceData) => db.createInvoice(invoiceData));
    ipcMain.handle('get-filtered-invoices', (event, filters) => db.getFilteredInvoices(filters));
    ipcMain.handle('get-invoice-details', (event, invoiceId) => db.getInvoiceDetails(invoiceId));
    ipcMain.handle('get-all-invoices', () => db.getAllInvoices?.() || []);
    ipcMain.handle('generate-invoice-number', () => db.generateInvoiceNumber());
}

/**
 * Sets up IPC handlers for data export functionalities.
 */
function setupExportHandlers() {
    if (!db) return;

    ipcMain.handle('export-invoices-csv', async (event, invoiceIds) => {
        try {
            if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices selected to export.' };
            
            const records = db.getInvoicesForExport(invoiceIds);
            if (!records || records.length === 0) return { success: false, message: 'No data found for the selected invoices.' };

            const headers = 'InvoiceNumber,Date,ClientName,SalesRep,ItemName,HSN,Quantity,FreeQuantity,UnitPrice,TotalPrice';
            const rows = records.map(r =>
                [`"${r.invoice_number}"`, `"${new Date(r.created_at).toLocaleDateString()}"`, `"${r.client_name}"`, `"${r.rep_name || 'N/A'}"`, `"${r.medicine_name}"`, `"${r.hsn}"`, r.quantity, r.free_quantity, r.unit_price, r.total_price].join(',')
            );
            const csvContent = [headers, ...rows].join('\n');

            const { filePath } = await dialog.showSaveDialog({ title: 'Export Sales to CSV', defaultPath: `sales-export-${new Date().toISOString().slice(0, 10)}.csv`, filters: [{ name: 'CSV Files', extensions: ['csv'] }] });
            
            if (filePath) {
                fs.writeFileSync(filePath, csvContent);
                return { success: true, path: filePath };
            }
            return { success: false, message: 'Save cancelled.' };
        } catch (error) {
            console.error('Failed to export to CSV:', error);
            return { success: false, message: error.message };
        }
    });

    ipcMain.handle('export-invoices-xlsx', async (event, invoiceIds) => {
        try {
            if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices selected to export.' };
            
            const records = db.getInvoicesForExport(invoiceIds);
            if (!records || records.length === 0) return { success: false, message: 'No data found for the selected invoices.' };

            const { filePath } = await dialog.showSaveDialog({ title: 'Export Sales to Excel', defaultPath: `sales-export-${new Date().toISOString().slice(0, 10)}.xlsx`, filters: [{ name: 'Excel Files', extensions: ['xlsx'] }] });
            
            if (!filePath) return { success: false, message: 'Save cancelled.' };

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Export');
            worksheet.columns = [
                { header: 'Invoice Number', key: 'invoice_number', width: 20 }, { header: 'Date', key: 'created_at', width: 15 },
                { header: 'Client Name', key: 'client_name', width: 30 }, { header: 'Sales Rep', key: 'rep_name', width: 20 },
                { header: 'Item Name', key: 'medicine_name', width: 30 }, { header: 'HSN', key: 'hsn', width: 15 },
                { header: 'Quantity', key: 'quantity', width: 10 }, { header: 'Free Quantity', key: 'free_quantity', width: 15 },
                { header: 'Unit Price', key: 'unit_price', width: 15, style: { numFmt: '"₹"#,##0.00' } },
                { header: 'Total Price', key: 'total_price', width: 15, style: { numFmt: '"₹"#,##0.00' } }
            ];
            records.forEach(record => worksheet.addRow(record));
            await workbook.xlsx.writeFile(filePath);

            return { success: true, path: filePath };
        } catch (error) {
            console.error('Failed to export to XLSX:', error);
            return { success: false, message: error.message };
        }
    });
}

/**
 * Sets up IPC handlers for managing application settings.
 */
function setupSettingsHandlers() {
    if (!db) return;
    ipcMain.handle('get-settings', () => db.getSettings());
    ipcMain.handle('update-settings', (event, settings) => db.updateSettings(settings));
}

/**
 * Sets up IPC handlers for data backup and restore.
 */
function setupBackupRestoreHandlers() {
    if (!db) return;

    ipcMain.handle('backup-data', async () => {
        try {
            const { filePath } = await dialog.showSaveDialog({
                title: 'Backup Database',
                defaultPath: `backup-${new Date().toISOString().slice(0, 10)}.db`,
                filters: [{ name: 'Database Files', extensions: ['db'] }]
            });

            if (filePath) {
                const sourcePath = db.getDbPath(); 
                fs.copyFileSync(sourcePath, filePath);
                return { success: true, message: 'Backup successful!', path: filePath };
            }
            return { success: false, message: 'Backup cancelled.' };
        } catch (error) {
            console.error('Backup failed:', error);
            return { success: false, message: `Backup failed: ${error.message}` };
        }
    });

    ipcMain.handle('restore-data', async () => {
        try {
            const { filePaths } = await dialog.showOpenDialog({
                title: 'Restore Database',
                properties: ['openFile'],
                filters: [{ name: 'Database Files', extensions: ['db'] }]
            });

            if (filePaths && filePaths.length > 0) {
                const backupPath = filePaths[0];
                const targetPath = db.getDbPath();

                db.close(); 
                fs.copyFileSync(backupPath, targetPath);
                
                db = new DatabaseService();
                initializeIpcHandlers(); 

                return { success: true, message: 'Restore successful! Please restart the application for changes to take full effect.' };
            }
            return { success: false, message: 'Restore cancelled.' };
        } catch (error) {
            console.error('Restore failed:', error);
            // Re-initialize the original database connection on failure
            db = new DatabaseService();
            initializeIpcHandlers();
            return { success: false, message: `Restore failed: ${error.message}` };
        }
    });
}


/**
 * Sets up miscellaneous IPC handlers.
 */
function setupMiscHandlers() {
    if (!db) return;
    ipcMain.handle('get-dashboard-stats', () => db.getDashboardStats());
}

/**
 * Initializes all IPC handlers for the application. It clears existing handlers
 * to ensure a clean setup, which is crucial for hot-reloading and after data restores.
 */
function initializeIpcHandlers() {
    // Clear all existing handlers to prevent errors on reload or restore
    ipcMain.handleNames().forEach(channel => {
        ipcMain.removeHandler(channel);
    });

    // Register all application handlers
    setupPdfHandlers();
    setupSupplierHandlers();
    setupPartyHandlers();
    setupSalesRepHandlers();
    setupMedicineHandlers();
    setupGroupHandlers();
    setupInvoiceHandlers();
    setupExportHandlers();
    setupSettingsHandlers();
    setupBackupRestoreHandlers();
    setupMiscHandlers();
}


// --- Application Lifecycle ---

app.whenReady().then(() => {
  db = new DatabaseService();
  createWindows();
  initializeIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});

