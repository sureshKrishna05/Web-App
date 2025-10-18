const express = require('express');
const path = require('path');
const DatabaseService = require('./src/database/database.js');
const { createInvoice, createQuotation } = require('./src/utils/invoiceGenerator.js');
const fs = require('fs');

const app = express();
const PORT = 3300;
const db = new DatabaseService();

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
            res.status(404).json({ error: 'Group not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
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


// PDF Download
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
            billItems: invoiceDetails.items.map(item => ({ ...item, name: item.medicine_name, price: item.unit_price })),
            totals: {
                subtotal: invoiceDetails.total_amount,
                tax: invoiceDetails.tax,
                finalAmount: invoiceDetails.final_amount
            },
            settings
        };

        const tempFilePath = path.join(__dirname, `invoice-${pdfData.invoiceNumber}.pdf`);
        const stream = fs.createWriteStream(tempFilePath);
        createInvoice(pdfData, stream);

        stream.on('finish', () => {
            res.download(tempFilePath, `invoice-${pdfData.invoiceNumber}.pdf`, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }
                // Clean up the temporary file
                fs.unlink(tempFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
                });
            });
        });

    } catch (error) {
        console.error('Failed to download invoice PDF:', error);
        res.status(500).json({ error: error.message });
    }
});


// In production, serve the React app for all other requests
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});