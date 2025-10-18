const { app, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const XLSX = require('xlsx');
const express = require('express');

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
const expressApp = express();
const PORT = 3300;

// --- Server Setup ---
// Serve the React build files from the 'dist' directory
expressApp.use(express.static(path.join(__dirname, 'dist')));


// --- IPC Handlers Setup ---
// This function initializes all the backend API endpoints your React app can call.
function initializeIpcHandlers() {
  if (!db) return;

  // --- PDF & Document Handlers ---
  // Note: Printing is now handled by saving the file, which the user can then print from their browser.
  ipcMain.handle('print-pdf', async (event, pdfData, type = 'invoice') => {
    const settings = db.getSettings();
    const fullPdfData = { ...pdfData, settings };
    const filePath = dialog.showSaveDialogSync({
        title: `Save ${type}`,
        defaultPath: `${type}-${Date.now()}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (filePath) {
        if (type === 'invoice') {
            createInvoice(fullPdfData, filePath);
        } else {
            createQuotation(fullPdfData, filePath);
        }
        return { success: true, path: filePath };
    }
    return { success: false, message: 'Save cancelled.' };
  });

  ipcMain.handle('download-invoice-pdf', (event, invoiceId) => {
    try {
      const invoiceDetails = db.getInvoiceDetails(invoiceId);
      if (!invoiceDetails) {
        throw new Error('Invoice not found.');
      }
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
        client: clientForPdf,
        billItems: invoiceDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
        totals: {
          subtotal: invoiceDetails.total_amount,
          tax: invoiceDetails.tax,
          finalAmount: invoiceDetails.final_amount
        },
        settings
      };
      const filePath = dialog.showSaveDialogSync({
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
  
  ipcMain.handle('download-quotation-pdf', (event, quotationId) => {
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

        // FIX #1: Removed incorrect destructuring of filePath here as well.
        const filePath = dialog.showSaveDialogSync({
            title: 'Download Quotation PDF',
            defaultPath: `quotation-${pdfData.quotationNumber}.pdf`,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });

        if (filePath) {
            createQuotation(pdfData, filePath);
            return { success: true, path: filePath };
        }
        return { success: false, message: 'Save cancelled.' };
    } catch (error) {
        console.error('Failed to download quotation PDF:', error);
        return { success: false, message: error.message };
    }
  });

  // --- Data Handlers (Suppliers, Parties, etc.) ---
  // These remain largely the same as they are backend logic.
  ipcMain.handle('get-all-suppliers', () => db.getAllSuppliers());
  ipcMain.handle('add-supplier', (event, supplier) => db.addSupplier(supplier));
  ipcMain.handle('update-supplier', (event, id, supplier) => db.updateSupplier(id, supplier));
  ipcMain.handle('delete-supplier', (event, id) => db.deleteSupplier(id));

  ipcMain.handle('get-all-parties', () => db.getAllParties());
  ipcMain.handle('get-party-by-id', (event, id) => db.getPartyById(id));
  ipcMain.handle('add-party', (event, party) => db.addParty(party));
  ipcMain.handle('update-party', (event, id, party) => db.updateParty(id, party));
  ipcMain.handle('delete-party', (event, id) => db.deleteParty(id));
  ipcMain.handle('search-parties', (event, searchTerm) => db.searchParties(searchTerm));
  ipcMain.handle('get-party-by-name', (event, name) => db.getPartyByName(name));

  ipcMain.handle('get-all-sales-reps', () => db.getAllSalesReps());
  ipcMain.handle('add-sales-rep', (event, employeeData) => db.addSalesRep(employeeData));
  ipcMain.handle('delete-sales-rep', (event, id) => db.deleteSalesRep(id));
  ipcMain.handle('get-rep-performance', (event, { repId, month }) => db.getRepPerformance(repId, month));
  ipcMain.handle('set-rep-target', (event, { repId, month, targetAmount }) => db.setRepTarget(repId, month, targetAmount));

  ipcMain.handle('get-all-medicines', () => db.getAllMedicines());
  ipcMain.handle('search-medicines', (event, searchTerm) => db.searchMedicines(searchTerm));
  ipcMain.handle('add-medicine', (event, medicine) => db.addMedicine(medicine));
  ipcMain.handle('update-medicine', (event, id, medicine) => db.updateMedicine(id, medicine));
  ipcMain.handle('delete-medicine', (event, id) => db.deleteMedicine(id));

  ipcMain.handle('get-all-groups', () => db.getAllGroups());
  ipcMain.handle('get-group-details', (event, id) => db.getGroupDetails(id));
  ipcMain.handle('add-group', (event, group) => db.addGroup(group));
  ipcMain.handle('update-group-gst', (event, { id, gst_percentage }) => db.updateGroupGst(id, gst_percentage));
  ipcMain.handle('delete-group', (event, id) => db.deleteGroup(id));

  ipcMain.handle('create-invoice', (event, invoiceData) => db.createInvoice(invoiceData));
  ipcMain.handle('get-filtered-invoices', (event, filters) => db.getFilteredInvoices(filters));
  ipcMain.handle('get-invoice-details', (event, invoiceId) => db.getInvoiceDetails(invoiceId));
  ipcMain.handle('generate-invoice-number', () => db.generateInvoiceNumber());

  ipcMain.handle('export-invoices-csv', (event, invoiceIds) => {
    try {
        if (!invoiceIds || invoiceIds.length === 0) return { success: false, message: 'No invoices selected.' };
        const records = db.getInvoicesForExport(invoiceIds);
        if (!records || records.length === 0) return { success: false, message: 'No data for selected invoices.' };
        const filePath = dialog.showSaveDialogSync({ title: 'Export to CSV', defaultPath: `sales-${Date.now()}.csv` });
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
        const filePath = dialog.showSaveDialogSync({ title: 'Export to Excel', defaultPath: `sales-${Date.now()}.xlsx` });
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

  ipcMain.handle('get-settings', () => db.getSettings());
  ipcMain.handle('update-settings', (event, settings) => db.updateSettings(settings));

  ipcMain.handle('backup-data', () => {
    try {
        const filePath = dialog.showSaveDialogSync(null, {
            title: 'Backup Database',
            defaultPath: `backup-${Date.now()}.db`,
            filters: [{ name: 'Database Files', extensions: ['db'] }]
        });
        if (filePath) {
            db.checkpointDb();
            fs.copyFileSync(db.getDbPath(), filePath);
            return { success: true, path: filePath };
        }
        return { success: false, message: 'Backup cancelled.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
  });

  ipcMain.handle('restore-data', () => {
    try {
        const filePaths = dialog.showOpenDialogSync(null, {
            title: 'Restore Database',
            properties: ['openFile'],
            filters: [{ name: 'Database Files', extensions: ['db'] }]
        });
        if (filePaths && filePaths.length > 0) {
            const backupPath = filePaths[0];
            const targetPath = db.getDbPath();
            if (db) db.close();
            fs.copyFileSync(backupPath, targetPath);
            dialog.showMessageBoxSync(null, {
                type: 'info',
                title: 'Restore Successful',
                message: 'Data has been restored. The application will now restart.'
            });
            app.relaunch();
            app.quit();
            return { success: true };
        }
        return { success: false, message: 'Save cancelled.' };
    } catch (error) {
        dialog.showErrorBox('Restore Failed', `An error occurred: ${error.message}. Please restart the application.`);
        app.quit();
        return { success: false, message: error.message };
    }
  });

  ipcMain.handle('get-dashboard-stats', () => db.getDashboardStats());
}

// --- Application Lifecycle ---
app.on('ready', () => {
  try {
    db = new DatabaseService();
    initializeIpcHandlers();

    // Start the express server
    expressApp.listen(PORT, async () => {
      console.log(`Server running at http://localhost:${PORT}`);
      // Open the URL in the default browser
      const { default: open } = await import('open');
      open(`http://localhost:${PORT}`);
    });

    // Set the app to launch on startup
    app.setLoginItemSettings({
      openAtLogin: true
    });

  } catch(error) {
    console.error("Failed to initialize application:", error);
    dialog.showErrorBox("Application Error", "Could not initialize the application. Please check the logs.");
    app.quit();
  }
});

// This prevents the app from quitting when all windows are closed,
// allowing it to run in the background.
app.on('window-all-closed', (e) => {
    // Intentionally left blank to keep the app running.
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});
