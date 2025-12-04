const express = require('express');
const path = require('path');
const DatabaseService = require('./src/database/database.js');
const { createInvoice, createQuotation } = require('./src/utils/invoiceGenerator.js');
const fs = require('fs');
const multer = require('multer'); // <-- Add multer

const app = express();
const PORT = 3300;
// Make db instance potentially re-assignable for restore
let db = new DatabaseService();

// --- Multer Configuration for Restore ---
// Store the uploaded file temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size (e.g., 100MB)
    fileFilter: (req, file, cb) => {
        // Accept only .db files
        if (path.extname(file.originalname).toLowerCase() === '.db') {
            cb(null, true);
        } else {
            cb(new Error('Only .db files are allowed!'), false);
        }
    }
});
// --- End Multer Config ---

app.use(express.json());

// Only serve static files from the 'dist' directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
}


// --- API Routes ---

// Dashboard
app.get('/api/dashboard-stats', (req, res) => {
    try {
        const stats = db.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Medicines
app.get('/api/medicines', (req, res) => {
    try {
        const medicines = db.getAllMedicines();
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/medicines/search', (req, res) => {
    try {
        const medicines = db.searchMedicines(req.query.term);
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/medicines', (req, res) => {
    try {
        const newMedicine = db.addMedicine(req.body);
        res.status(201).json(newMedicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/medicines/:id', (req, res) => {
    try {
        const updated = db.updateMedicine(req.params.id, req.body);
        if (updated) {
            res.json({ message: 'Medicine updated successfully' });
        } else {
            res.status(404).json({ error: 'Medicine not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/medicines/:id', (req, res) => {
    try {
        const deleted = db.deleteMedicine(req.params.id);
        if (deleted) {
            res.json({ message: 'Medicine deleted successfully' });
        } else {
            res.status(404).json({ error: 'Medicine not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Parties (Clients)
app.get('/api/parties', (req, res) => {
    try {
        const parties = db.getAllParties();
        res.json(parties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/parties/search', (req, res) => {
    try {
        const parties = db.searchParties(req.query.term);
        res.json(parties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/parties', (req, res) => {
    try {
        const newParty = db.addParty(req.body);
        res.status(201).json(newParty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/parties/:id', (req, res) => {
    try {
        const updated = db.updateParty(req.params.id, req.body);
        if (updated) {
            res.json({ message: 'Party updated successfully' });
        } else {
            res.status(404).json({ error: 'Party not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/parties/:id', (req, res) => {
    try {
        const deleted = db.deleteParty(req.params.id);
        if (deleted) {
            res.json({ message: 'Party deleted successfully' });
        } else {
            res.status(404).json({ error: 'Party not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Invoices
app.get('/api/invoices/new-number', (req, res) => {
    try {
        const invoiceNumber = db.generateInvoiceNumber();
        res.json({ invoiceNumber });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/invoices/filtered', (req, res) => {
    try {
        const invoices = db.getFilteredInvoices(req.body);
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/invoices', (req, res) => {
    try {
        const invoiceId = db.createInvoice(req.body);
        res.status(201).json({ invoiceId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Sales Reps
app.get('/api/sales-reps', (req, res) => {
    try {
        const reps = db.getAllSalesReps();
        res.json(reps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sales-reps', (req, res) => {
    try {
        const newRep = db.addSalesRep(req.body);
        res.status(201).json(newRep);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/sales-reps/:id', (req, res) => {
    try {
        const deleted = db.deleteSalesRep(req.params.id);
        if (deleted) {
            res.json({ message: 'Sales rep deleted successfully' });
        } else {
            res.status(404).json({ error: 'Sales rep not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Groups
app.get('/api/groups', (req, res) => {
    try {
        const groups = db.getAllGroups();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/groups/:id', (req, res) => {
    try {
        const group = db.getGroupDetails(req.params.id);
        if (group) {
            res.json(group);
        } else {
            res.status(404).json({ error: 'Group not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/groups', (req, res) => {
    try {
        const newGroup = db.addGroup(req.body);
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/groups/:id', (req, res) => {
    try {
        const updated = db.updateGroupGst(req.params.id, req.body.gst_percentage);
        if (updated) {
            res.json({ message: 'Group updated successfully' });
        } else {
            res.status(404).json({ error: 'Group not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/groups/:id', (req, res) => {
    try {
        const deleted = db.deleteGroup(req.params.id);
        if (deleted) {
            res.json({ message: 'Group deleted successfully' });
        } else {
            res.status(404).json({ error: 'Group not found or contains items' });
        }
    } catch (error) {
        // Handle specific error for group containing items
        if (error.message.includes("Cannot delete group")) {
             res.status(400).json({ error: error.message });
        } else {
             res.status(500).json({ error: 'Failed to delete group: ' + error.message });
        }
    }
});

// Suppliers
app.get('/api/suppliers', (req, res) => {
    try {
        const suppliers = db.getAllSuppliers();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/suppliers', (req, res) => {
    try {
        const newSupplier = db.addSupplier(req.body);
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/suppliers/:id', (req, res) => {
    try {
        const updated = db.updateSupplier(req.params.id, req.body);
        if (updated) {
            res.json({ message: 'Supplier updated successfully' });
        } else {
            res.status(404).json({ error: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/suppliers/:id', (req, res) => {
    try {
        const deleted = db.deleteSupplier(req.params.id);
        if (deleted) {
            res.json({ message: 'Supplier deleted successfully' });
        } else {
            res.status(404).json({ error: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Settings
app.get('/api/settings', (req, res) => {
    try {
        const settings = db.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        db.updateSettings(req.body);
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- NEW: Backup Endpoint ---
app.get('/api/backup-db', (req, res) => {
    try {
        const dbPath = db.getDbPath(); // Get the actual path from DatabaseService
        // Ensure data consistency before backup
        db.checkpointDb();

        // Check if file exists
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Database file not found.' });
        }

        const dateStamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const backupFilename = `pharmacy-backup-${dateStamp}.db`;

        res.download(dbPath, backupFilename, (err) => {
            if (err) {
                console.error("Error sending backup file:", err);
                // Avoid sending error response if headers already sent
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to download backup file.' });
                }
            }
        });
    } catch (error) {
        console.error("Backup Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to create backup: ' + error.message });
        }
    }
});

// --- NEW: Restore Endpoint ---
// Use multer middleware to handle the single file upload named 'dbfile'
app.post('/api/restore-db', upload.single('dbfile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No database file uploaded.' });
    }

    const currentDbPath = db.getDbPath();
    const backupPath = currentDbPath + '.backup-' + Date.now(); // Create a backup of the current DB
    let originalDbRestored = false;

    try {
        console.log("Closing current database connection...");
        db.close(); // Close the current DB connection

        console.log(`Backing up current DB to ${backupPath}...`);
        fs.renameSync(currentDbPath, backupPath); // Rename current DB as a backup

        console.log(`Writing uploaded file to ${currentDbPath}...`);
        fs.writeFileSync(currentDbPath, req.file.buffer); // Write the uploaded buffer to the original DB path

        console.log("Re-initializing database service...");
        // Re-initialize the database service with the new file
        db = new DatabaseService(); // Replace the global/module-level instance

        res.json({ message: 'Database restored successfully. Please verify the data.' });
        console.log("Database restore completed.");

    } catch (error) {
        console.error("Restore Error:", error);
        // Attempt to restore the backup if something went wrong during write/re-init
        if (fs.existsSync(backupPath)) {
            console.log("Attempting to restore backup due to error...");
            try {
                 // Ensure current (potentially corrupt) file is removed before renaming backup
                 if (fs.existsSync(currentDbPath) && !originalDbRestored) {
                    fs.unlinkSync(currentDbPath);
                 }
                fs.renameSync(backupPath, currentDbPath);
                db = new DatabaseService(); // Re-initialize with the original DB
                originalDbRestored = true;
                console.log("Original database restored from backup.");
            } catch (restoreError) {
                console.error("CRITICAL: Failed to restore backup after failed restore attempt:", restoreError);
                // At this point, manual intervention might be required.
                // Send error even if headers might have been sent (best effort)
                return res.status(500).json({ error: 'Critical error during restore and backup recovery. Manual check required. Original error: ' + error.message });
            }
        }
        // Send the original error if backup restoration wasn't needed or failed critically
         if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to restore database: ' + error.message });
         }

    } finally {
        // Optional: Clean up the temporary backup file if restore was successful and no errors occurred
        // Be cautious with this in case verification is needed.
        // if (fs.existsSync(backupPath) && !originalDbRestored && !res.headersSent /* check if response indicates success */ ) {
        //     try {
        //         fs.unlinkSync(backupPath);
        //         console.log("Cleaned up temporary backup file.");
        //     } catch (cleanupError) {
        //         console.error("Failed to clean up backup file:", cleanupError);
        //     }
        // }
    }
});


// ========== [START] PDF Download Fix ==========
// This section has been updated to stream the PDF directly
// instead of saving a temporary file, which caused the 500 error.
app.post('/api/download-invoice-pdf', (req, res) => {
    try {
        const { invoiceId } = req.body;
        const invoiceDetails = db.getInvoiceDetails(invoiceId);
        if (!invoiceDetails) {
            return res.status(404).json({ error: 'Invoice not found.' });
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
            billItems: invoiceDetails.items.map(item => ({
                name: item.medicine_name,
                hsn: item.hsn,
                batch_number: item.batch_number,
                quantity: item.quantity,
                price: item.unit_price,
                gst_percentage: item.gst_percentage || 0
            })),
            totals: {
                subtotal: invoiceDetails.total_amount,
                tax: invoiceDetails.tax,
                finalAmount: invoiceDetails.final_amount
            },
            settings
        };

        // --- MODIFIED SECTION ---
        // Set headers for PDF download
        const filename = `invoice-${pdfData.invoiceNumber}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Generate the PDF and pipe it directly to the response (res)
        // The createInvoice function will call .end() on the stream (res)
        createInvoice(pdfData, res); 
        // --- END MODIFIED SECTION ---

    } catch (error) {
        console.error('Failed to download invoice PDF:', error);
        // Check if headers have been sent. If not, we can send a JSON error.
        // If they have (e.g., PDF generation started), we can only end the response.
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});
// ========== [END] PDF Download Fix ==========


// In production, serve the React app for all other requests
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  db.close();
  process.exit(0);
});