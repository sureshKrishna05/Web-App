const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const XLSX = require('xlsx');

// --- START: CORRECTED REQUIRE STATEMENTS ---
const DatabaseService = require('./src/database/database.js');
const { createInvoice, createQuotation } = require('./src/utils/invoiceGenerator.js');
// --- END: CORRECTED REQUIRE STATEMENTS ---

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// --- Global Variables ---
let db;
let mainWindow;
let printWindow; // Hidden window for silent printing

// --- IPC Handlers Setup ---
function setupPdfHandlers() {
  if (!db) return;

  // --- START: CORRECTED PRINT-PDF HANDLER ---
  ipcMain.handle('print-pdf', async (event, pdfData, type = 'invoice') => {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `print-${Date.now()}.pdf`);

    try {
      const settings = db.getSettings();
      const fullPdfData = { ...pdfData, settings };

      if (type === 'invoice') {
        createInvoice(fullPdfData, tempFilePath);
      } else if (type === 'quotation') {
        createQuotation(fullPdfData, tempFilePath);
      } else {
        throw new Error(`Invalid document type for printing: ${type}`);
      }

      await printWindow.loadFile(tempFilePath);
      
      // Wrap the print function in a promise to handle the callback correctly
      await new Promise((resolve, reject) => {
        printWindow.webContents.print({ silent: false, printBackground: true }, (success, reason) => {
          if (success) {
            resolve();
          } else {
            reject(new Error(`Printing failed: ${reason}`));
          }
        });
      });

      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Failed to delete temporary PDF:', err);
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to create or print PDF:', error);
      // Clean up the temp file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return { success: false, message: error.message };
    }
  });
  // --- END: CORRECTED PRINT-PDF HANDLER ---

  // --- START: CORRECTED DOWNLOAD-INVOICE-PDF HANDLER ---
  ipcMain.handle('download-invoice-pdf', (event, invoiceId) => {
    try {
      const invoiceDetails = db.getInvoiceDetails(invoiceId);
      if (!invoiceDetails) {
        throw new Error('Invoice not found.');
      }

      // The client details are already in invoiceDetails from the database join.
      // We create a client object from the retrieved data.
      const clientForPdf = {
          name: invoiceDetails.client_name,
          address: invoiceDetails.client_address,
          phone: invoiceDetails.client_phone,
          gstin: invoiceDetails.client_gstin // Assuming you add this to the getInvoiceDetails query
      };

      const settings = db.getSettings();

      const pdfData = {
        invoiceNumber: invoiceDetails.invoice_number,
        paymentMode: invoiceDetails.payment_mode || 'N/A',
        client: clientForPdf,
        billItems: invoiceDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
        totals: {
          subtotal: invoiceDetails.total_amount,
          tax: invoiceDetails.tax,
          finalAmount: invoiceDetails.final_amount
        },
        settings
      };

      const { filePath } = dialog.showSaveDialogSync({
        title: 'Download Invoice PDF',
        defaultPath: `invoice-${pdfData.invoiceNumber}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (filePath) {
        createInvoice(pdfData, filePath);
        return { success: true, path: filePath };
      }
      return { success: false, message: 'Save cancelled.' };
    } catch (error) {
      console.error('Failed to download invoice PDF:', error);
      return { success: false, message: error.message };
    }
  });
  // --- END: CORRECTED DOWNLOAD-INVOICE-PDF HANDLER ---
  
 ipcMain.handle('download-invoice-pdf', (event, invoiceId) => {
    try {
      const invoiceDetails = db.getInvoiceDetails(invoiceId);
      if (!invoiceDetails) {
        throw new Error('Invoice not found.');
      }

      // Construct a client object from the query results.
      // This gracefully handles cases where the client was deleted (fields will be null).
      const clientForPdf = {
          name: invoiceDetails.client_name,
          address: invoiceDetails.client_address,
          phone: invoiceDetails.client_phone,
          gstin: invoiceDetails.client_gstin
      };

      const settings = db.getSettings();

      const pdfData = {
        invoiceNumber: invoiceDetails.invoice_number,
        paymentMode: invoiceDetails.payment_mode || 'N/A',
        client: clientForPdf, // Use the safely constructed client object
        billItems: invoiceDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
        totals: {
          subtotal: invoiceDetails.total_amount,
          tax: invoiceDetails.tax,
          finalAmount: invoiceDetails.final_amount
        },
        settings
      };

      const { filePath } = dialog.showSaveDialogSync({
        title: 'Download Invoice PDF',
        defaultPath: `invoice-${pdfData.invoiceNumber}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (filePath) {
        createInvoice(pdfData, filePath);
        return { success: true, path: filePath };
      }
      return { success: false, message: 'Save cancelled.' };
    } catch (error) {
      console.error('Failed to download invoice PDF:', error);
      return { success: false, message: error.message };
    }
  });
}

function setupSupplierHandlers() {
    ipcMain.handle('get-all-suppliers', () => db.getAllSuppliers());
    ipcMain.handle('add-supplier', (event, supplier) => db.addSupplier(supplier));
    ipcMain.handle('update-supplier', (event, id, supplier) => db.updateSupplier(id, supplier));
    ipcMain.handle('delete-supplier', (event, id) => db.deleteSupplier(id));
}

function setupPartyHandlers() {
    ipcMain.handle('get-all-parties', () => db.getAllParties());
    ipcMain.handle('get-party-by-id', (event, id) => db.getPartyById(id));
    ipcMain.handle('add-party', (event, party) => db.addParty(party));
    ipcMain.handle('update-party', (event, id, party) => db.updateParty(id, party));
    ipcMain.handle('delete-party', (event, id) => db.deleteParty(id));
    ipcMain.handle('search-parties', (event, searchTerm) => db.searchParties(searchTerm));
    ipcMain.handle('get-party-by-name', (event, name) => db.getPartyByName(name));
}

function setupSalesRepHandlers() {
    ipcMain.handle('get-all-sales-reps', () => db.getAllSalesReps());
    ipcMain.handle('add-sales-rep', (event, employeeData) => db.addSalesRep(employeeData));
    ipcMain.handle('delete-sales-rep', (event, id) => db.deleteSalesRep(id));
    ipcMain.handle('get-rep-performance', (event, { repId, month }) => db.getRepPerformance(repId, month));
    ipcMain.handle('set-rep-target', (event, { repId, month, targetAmount }) => db.setRepTarget(repId, month, targetAmount));
}

function setupMedicineHandlers() {
    ipcMain.handle('get-all-medicines', () => db.getAllMedicines());
    ipcMain.handle('search-medicines', (event, searchTerm) => db.searchMedicines(searchTerm));
    ipcMain.handle('add-medicine', (event, medicine) => db.addMedicine(medicine));
    ipcMain.handle('update-medicine', (event, id, medicine) => db.updateMedicine(id, medicine));
    ipcMain.handle('delete-medicine', (event, id) => db.deleteMedicine(id));
}

function setupGroupHandlers() {
    ipcMain.handle('get-all-groups', () => db.getAllGroups());
    ipcMain.handle('get-group-details', (event, id) => db.getGroupDetails(id));
    ipcMain.handle('add-group', (event, group) => db.addGroup(group));
    ipcMain.handle('update-group-gst', (event, { id, gst_percentage }) => db.updateGroupGst(id, gst_percentage));
    ipcMain.handle('delete-group', (event, id) => db.deleteGroup(id));
}

function setupInvoiceHandlers() {
    ipcMain.handle('create-invoice', (event, invoiceData) => db.createInvoice(invoiceData));
    ipcMain.handle('get-filtered-invoices', (event, filters) => db.getFilteredInvoices(filters));
    ipcMain.handle('get-invoice-details', (event, invoiceId) => db.getInvoiceDetails(invoiceId));
    ipcMain.handle('generate-invoice-number', () => db.generateInvoiceNumber());
}

function setupExportHandlers() {
    ipcMain.handle('export-invoices-csv', (event, invoiceIds) => {
        try {
            if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices selected.' };
            const records = db.getInvoicesForExport(invoiceIds);
            if (!records || records.length === 0) return { success: false, message: 'No data for selected invoices.' };

            const { filePath } = dialog.showSaveDialogSync({ title: 'Export to CSV', defaultPath: `sales-${Date.now()}.csv` });
            if (!filePath) return { success: false, message: 'Save cancelled.' };

            const worksheet = XLSX.utils.json_to_sheet(records);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
            XLSX.writeFile(workbook, filePath, { bookType: 'csv' });

            return { success: true, path: filePath };
        } catch (error) {
            return { success: false, message: error.message };
        }
    });

    ipcMain.handle('export-invoices-xlsx', (event, invoiceIds) => {
        try {
            if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices selected.' };
            const records = db.getInvoicesForExport(invoiceIds);
            if (!records || records.length === 0) return { success: false, message: 'No data for selected invoices.' };
            
            const { filePath } = dialog.showSaveDialogSync({ title: 'Export to Excel', defaultPath: `sales-${Date.now()}.xlsx` });
            if (!filePath) return { success: false, message: 'Save cancelled.' };
            
            const worksheet = XLSX.utils.json_to_sheet(records);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
            XLSX.writeFile(workbook, filePath);

            return { success: true, path: filePath };
        } catch (error) {
            return { success: false, message: error.message };
        }
    });
}

function setupSettingsHandlers() {
    ipcMain.handle('get-settings', () => db.getSettings());
    ipcMain.handle('update-settings', (event, settings) => db.updateSettings(settings));
}

// In main.js

function setupBackupRestoreHandlers() {
    ipcMain.handle('backup-data', async () => {
        try {
            // --- START: CORRECTED LOGIC ---
            // 1. Get the file path from the user FIRST. This is an async operation.
            const { filePath } = await dialog.showSaveDialog({
                title: 'Backup Database',
                defaultPath: `backup-${Date.now()}.db`,
                filters: [{ name: 'Database Files', extensions: ['db'] }]
            });

            // 2. If the user selected a path (didn't cancel), then perform the blocking operations.
            if (filePath) {
                db.checkpointDb(); // Force a checkpoint
                fs.copyFileSync(db.getDbPath(), filePath); // Copy the file
                return { success: true, path: filePath };
            }
            // --- END: CORRECTED LOGIC ---

            return { success: false, message: 'Backup cancelled.' };
        } catch (error) {
            return { success: false, message: error.message };
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

                // It's critical to close the database BEFORE overwriting the file.
                if (db) db.close();

                fs.copyFileSync(backupPath, targetPath);

                dialog.showMessageBoxSync(mainWindow, {
                    type: 'info',
                    title: 'Restore Successful',
                    message: 'Data has been restored. The application will now restart.'
                });
                
                app.relaunch();
                app.quit();

                return { success: true };
            }
            return { success: false, message: 'Restore cancelled.' };
        } catch (error) {
            dialog.showErrorBox('Restore Failed', `An error occurred: ${error.message}. Please restart the application.`);
            app.quit();
            return { success: false, message: error.message };
        }
    });
}

function setupMiscHandlers() {
    ipcMain.handle('get-dashboard-stats', () => db.getDashboardStats());
}

const allHandlerSetups = [
    setupPdfHandlers,
    setupSupplierHandlers,
    setupPartyHandlers,
    setupSalesRepHandlers,
    setupMedicineHandlers,
    setupGroupHandlers,
    setupInvoiceHandlers,
    setupExportHandlers,
    setupSettingsHandlers,
    setupBackupRestoreHandlers,
    setupMiscHandlers,
];

/**
 * Initializes all IPC handlers for the application.
 */
function initializeIpcHandlers() {
    allHandlerSetups.forEach(setup => setup());
}

const createWindows = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  printWindow = new BrowserWindow({ show: false });
  
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// --- Application Lifecycle ---
function initializeApp() {
  try {
    db = new DatabaseService();
    initializeIpcHandlers();
    app.on('ready', createWindows);
  } catch(error) {
    console.error("Failed to initialize application:", error);
    dialog.showErrorBox("Application Error", "Could not initialize the application. Please check the logs.");
    app.quit();
  }
}

initializeApp();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});