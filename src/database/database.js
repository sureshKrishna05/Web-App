const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseService {
    constructor() {
        // Get the user data directory for storing the database
        const userDataPath = app ? app.getPath('userData') : './';
        const dbPath = path.join(userDataPath, 'pharmacy.db');
        
        this.db = new Database(dbPath);
        this.initializeTables();
    }

    initializeTables() {
        // Create medicines table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                batch_number TEXT,
                expiry_date TEXT,
                price REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create invoices table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE NOT NULL,
                patient_name TEXT,
                total_amount REAL NOT NULL,
                discount REAL DEFAULT 0,
                tax REAL DEFAULT 0,
                final_amount REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create invoice_items table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                medicine_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                total_price REAL NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices (id),
                FOREIGN KEY (medicine_id) REFERENCES medicines (id)
            )
        `);

        // Create indexes for better performance
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
            CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
            CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
        `);

        console.log('Database tables initialized successfully');
    }

    // Medicine operations
    getAllMedicines() {
        const stmt = this.db.prepare('SELECT * FROM medicines ORDER BY name');
        return stmt.all();
    }

    getMedicineById(id) {
        const stmt = this.db.prepare('SELECT * FROM medicines WHERE id = ?');
        return stmt.get(id);
    }

    searchMedicines(searchTerm) {
        const stmt = this.db.prepare('SELECT * FROM medicines WHERE name LIKE ? ORDER BY name');
        return stmt.all(`%${searchTerm}%`);
    }

    addMedicine(medicine) {
        const stmt = this.db.prepare(`
            INSERT INTO medicines (name, batch_number, expiry_date, price, stock)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            medicine.name,
            medicine.batch_number,
            medicine.expiry_date,
            medicine.price,
            medicine.stock
        );
        return { id: result.lastInsertRowid, ...medicine };
    }

    updateMedicine(id, medicine) {
        const stmt = this.db.prepare(`
            UPDATE medicines 
            SET name = ?, batch_number = ?, expiry_date = ?, price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        const result = stmt.run(
            medicine.name,
            medicine.batch_number,
            medicine.expiry_date,
            medicine.price,
            medicine.stock,
            id
        );
        return result.changes > 0;
    }

    deleteMedicine(id) {
        const stmt = this.db.prepare('DELETE FROM medicines WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    updateMedicineStock(id, newStock) {
        const stmt = this.db.prepare('UPDATE medicines SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const result = stmt.run(newStock, id);
        return result.changes > 0;
    }

    // Invoice operations
    createInvoice(invoiceData) {
        const transaction = this.db.transaction((invoice, items) => {
            // Insert invoice
            const invoiceStmt = this.db.prepare(`
                INSERT INTO invoices (invoice_number, patient_name, total_amount, discount, tax, final_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const invoiceResult = invoiceStmt.run(
                invoice.invoice_number,
                invoice.patient_name,
                invoice.total_amount,
                invoice.discount,
                invoice.tax,
                invoice.final_amount
            );
            const invoiceId = invoiceResult.lastInsertRowid;

            // Insert invoice items and update stock
            const itemStmt = this.db.prepare(`
                INSERT INTO invoice_items (invoice_id, medicine_id, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
            `);
            const stockStmt = this.db.prepare('UPDATE medicines SET stock = stock - ? WHERE id = ?');

            for (const item of items) {
                itemStmt.run(invoiceId, item.medicine_id, item.quantity, item.unit_price, item.total_price);
                stockStmt.run(item.quantity, item.medicine_id);
            }

            return invoiceId;
        });

        return transaction(invoiceData, invoiceData.items);
    }

    getAllInvoices() {
        const stmt = this.db.prepare(`
            SELECT * FROM invoices 
            ORDER BY created_at DESC
        `);
        return stmt.all();
    }

    getInvoiceById(id) {
        const invoiceStmt = this.db.prepare('SELECT * FROM invoices WHERE id = ?');
        const itemsStmt = this.db.prepare(`
            SELECT ii.*, m.name as medicine_name 
            FROM invoice_items ii
            JOIN medicines m ON ii.medicine_id = m.id
            WHERE ii.invoice_id = ?
        `);
        
        const invoice = invoiceStmt.get(id);
        if (invoice) {
            invoice.items = itemsStmt.all(id);
        }
        return invoice;
    }

    // Dashboard statistics
    getDashboardStats() {
        const totalMedicines = this.db.prepare('SELECT COUNT(*) as count FROM medicines').get().count;
        const lowStockItems = this.db.prepare('SELECT COUNT(*) as count FROM medicines WHERE stock < 10').get().count;
        const totalInvoices = this.db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;
        const recentMedicines = this.db.prepare('SELECT * FROM medicines ORDER BY created_at DESC LIMIT 5').all();

        return {
            totalMedicines,
            lowStockItems,
            totalInvoices,
            recentMedicines
        };
    }

    // Generate unique invoice number
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) = DATE("now")');
        const todayCount = stmt.get().count + 1;
        
        return `INV-${year}${month}${day}-${String(todayCount).padStart(3, '0')}`;
    }

    close() {
        this.db.close();
    }
}

module.exports = DatabaseService;
