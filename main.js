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

// --- IPC Handlers Setup ---

/**
 * Sets up IPC handlers related to PDF generation, printing, and downloading.
 */
function setupPdfHandlers() {
  if (!db) return;

  ipcMain.handle('print-pdf', async (event, pdfData, type = 'invoice') => {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `print-${Date.now()}.pdf`);

    try {
      const settings = db.getSettings();
      const fullPdfData = { ...pdfData, settings };

      if (type === 'invoice') {
        await createInvoice(fullPdfData, tempFilePath);
      } else if (type === 'quotation') {
        await createQuotation(fullPdfData, tempFilePath);
      } else {
        throw new Error(`Invalid document type for printing: ${type}`);
      }

      await printWindow.loadFile(tempFilePath);

      printWindow.webContents.once('did-finish-load', () => {
        printWindow.webContents.print({ silent: false, printBackground: true }, (success, reason) => {
          if (!success) console.error('Printing failed:', reason);
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

  ipcMain.handle('download-invoice-pdf', async (event, invoiceId) => {
    try {
      const invoiceDetails = db.getInvoiceDetails(invoiceId);
      if (!invoiceDetails) return { success: false, message: 'Invoice not found.' };

      const clientDetails = db.getPartyById(invoiceDetails.client_id);
      if (!clientDetails) return { success: false, message: 'Client details not found.' };

      const settings = db.getSettings();

      const pdfData = {
        invoiceNumber: invoiceDetails.invoice_number,
        paymentMode: invoiceDetails.payment_mode || 'N/A',
        client: clientDetails,
        billItems: invoiceDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
        totals: {
          subtotal: invoiceDetails.total_amount,
          tax: invoiceDetails.tax,
          finalAmount: invoiceDetails.final_amount
        },
        settings
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
  
  ipcMain.handle('download-quotation-pdf', async (event, quotationId) => {
    try {
        const quotationDetails = db.getQuotationDetails(quotationId);
        if (!quotationDetails) return { success: false, message: 'Quotation not found.' };

        const clientDetails = db.getPartyById(quotationDetails.client_id);
        if (!clientDetails) return { success: false, message: 'Client details not found.' };
        
        const settings = db.getSettings();

        const pdfData = {
            quotationNumber: quotationDetails.quotation_number,
            client: clientDetails,
            billItems: quotationDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
            totals: {
                subtotal: quotationDetails.total_amount,
                tax: quotationDetails.tax,
                finalAmount: quotationDetails.final_amount
            },
            settings
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
    ipcMain.handle('export-invoices-csv', async (event, invoiceIds) => {
        try {
            if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices selected.' };
            const records = db.getInvoicesForExport(invoiceIds);
            if (!records || records.length === 0) return { success: false, message: 'No data for selected invoices.' };

            const { filePath } = await dialog.showSaveDialog({ title: 'Export to CSV', defaultPath: `sales-${Date.now()}.csv` });
            if (!filePath) return { success: false, message: 'Save cancelled.' };

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales');
            worksheet.columns = [
                { header: 'Invoice Number', key: 'invoice_number' },
                { header: 'Date', key: 'created_at' },
                { header: 'Client Name', key: 'client_name' },
                { header: 'Sales Rep', key: 'rep_name' },
                { header: 'Item Name', key: 'medicine_name' },
                { header: 'HSN', key: 'hsn' },
                { header: 'Quantity', key: 'quantity' },
                { header: 'Free Quantity', key: 'free_quantity' },
                { header: 'Unit Price', key: 'unit_price' },
                { header: 'Total Price', key: 'total_price' },
            ];
            worksheet.addRows(records);
            await workbook.csv.writeFile(filePath);
            return { success: true, path: filePath };
        } catch (error) {
            return { success: false, message: error.message };
        }
    });

    ipcMain.handle('export-invoices-xlsx', async (event, invoiceIds) => {
        try {
            if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices selected.' };
            const records = db.getInvoicesForExport(invoiceIds);
            if (!records || records.length === 0) return { success: false, message: 'No data for selected invoices.' };
            
            const { filePath } = await dialog.showSaveDialog({ title: 'Export to Excel', defaultPath: `sales-${Date.now()}.xlsx` });
            if (!filePath) return { success: false, message: 'Save cancelled.' };

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales');
            worksheet.columns = [
                { header: 'Invoice Number', key: 'invoice_number', width: 20 },
                { header: 'Date', key: 'created_at', width: 15 },
                { header: 'Client Name', key: 'client_name', width: 30 },
                { header: 'Sales Rep', key: 'rep_name', width: 20 },
                { header: 'Item Name', key: 'medicine_name', width: 30 },
                { header: 'HSN', key: 'hsn', width: 15 },
                { header: 'Quantity', key: 'quantity', width: 10 },
                { header: 'Free Quantity', key: 'free_quantity', width: 15 },
                { header: 'Unit Price', key: 'unit_price', width: 15, style: { numFmt: '"₹"#,##0.00' } },
                { header: 'Total Price', key: 'total_price', width: 15, style: { numFmt: '"₹"#,##0.00' } }
            ];
            worksheet.addRows(records);
            await workbook.xlsx.writeFile(filePath);
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

function setupBackupRestoreHandlers() {
    ipcMain.handle('backup-data', async () => {
        try {
            const { filePath } = await dialog.showSaveDialog({
                title: 'Backup Database',
                defaultPath: `backup-${Date.now()}.db`,
                filters: [{ name: 'Database Files', extensions: ['db'] }]
            });
            if (filePath) {
                fs.copyFileSync(db.getDbPath(), filePath);
                return { success: true, path: filePath };
            }
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

                // 1. Close the current database connection.
                db.close();

                // 2. Replace the database file.
                fs.copyFileSync(backupPath, targetPath);

                // 3. Show a success message and quit the app. The user will restart manually.
                dialog.showMessageBoxSync(mainWindow, {
                    type: 'info',
                    title: 'Restore Successful',
                    message: 'Data has been restored successfully. Please close and restart the application for the changes to take effect.'
                });
                
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

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  printWindow = new BrowserWindow({ show: false });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// --- Application Lifecycle ---

function initializeApp() {
  try {
    db = new DatabaseService();
    initializeIpcHandlers();
    createWindows();
  } catch(error) {
    console.error("Failed to initialize application:", error);
    dialog.showErrorBox("Application Error", "Could not initialize the application. Please check the logs.");
    app.quit();
  }
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  }
});