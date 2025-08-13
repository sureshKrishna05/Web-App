const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseService {
    constructor() {
        try {
            const userDataPath = app.getPath('userData');
            const dbPath = path.join(userDataPath, 'pharmacy.db');
            
            this.db = new Database(dbPath);
            this.db.pragma('journal_mode = WAL'); // Good for performance
            this.initializeTables();
        } catch (error) {
            console.error("Failed to initialize database connection:", error);
            // If the app cannot run without a DB, it's better to exit.
            app.quit();
        }
    }

    initializeTables() {
        // Your table creation logic is excellent and remains unchanged.
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, batch_number TEXT,
                expiry_date TEXT, price REAL NOT NULL, stock INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT UNIQUE NOT NULL, patient_name TEXT,
                total_amount REAL NOT NULL, discount REAL DEFAULT 0, tax REAL DEFAULT 0,
                final_amount REAL NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_id INTEGER NOT NULL, medicine_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL, unit_price REAL NOT NULL, total_price REAL NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices (id), FOREIGN KEY (medicine_id) REFERENCES medicines (id)
            )
        `);
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
            CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
            CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
        `);
        console.log('Database tables initialized successfully');
    }

    // --- General Query Runner with Error Handling ---
    run(query, params) {
        try {
            return query.run(params);
        } catch (error) {
            console.error('DB Run Error:', error.message);
            throw error; // Re-throw to be caught by IPC handler
        }
    }

    get(query, params) {
        try {
            return query.get(params);
        } catch (error) {
            console.error('DB Get Error:', error.message);
            throw error;
        }
    }

    all(query, params) {
        try {
            return query.all(params);
        } catch (error) {
            console.error('DB All Error:', error.message);
            throw error;
        }
    }

    // --- Medicine Operations ---
    getAllMedicines() {
        const stmt = this.db.prepare('SELECT * FROM medicines ORDER BY name');
        return this.all(stmt);
    }
    
    searchMedicines(searchTerm) {
        const stmt = this.db.prepare('SELECT * FROM medicines WHERE name LIKE ? ORDER BY name');
        return this.all(stmt, `%${searchTerm}%`);
    }

    addMedicine(medicine) {
        const stmt = this.db.prepare(`
            INSERT INTO medicines (name, batch_number, expiry_date, price, stock)
            VALUES (@name, @batch_number, @expiry_date, @price, @stock)
        `);
        const result = this.run(stmt, medicine);
        return { id: result.lastInsertRowid, ...medicine };
    }

    updateMedicine(id, medicine) {
        const stmt = this.db.prepare(`
            UPDATE medicines SET name = @name, batch_number = @batch_number, expiry_date = @expiry_date, 
            price = @price, stock = @stock, updated_at = CURRENT_TIMESTAMP WHERE id = @id
        `);
        const result = this.run(stmt, { id, ...medicine });
        return result.changes > 0;
    }

    deleteMedicine(id) {
        const stmt = this.db.prepare('DELETE FROM medicines WHERE id = ?');
        const result = this.run(stmt, id);
        return result.changes > 0;
    }

    // --- Invoice Operations ---
    createInvoice(invoiceData) {
        const transaction = this.db.transaction((invoice) => {
            const invoiceStmt = this.db.prepare(`
                INSERT INTO invoices (invoice_number, patient_name, total_amount, discount, tax, final_amount)
                VALUES (@invoice_number, @patient_name, @total_amount, @discount, @tax, @final_amount)
            `);
            const invoiceResult = this.run(invoiceStmt, invoice);
            const invoiceId = invoiceResult.lastInsertRowid;

            const itemStmt = this.db.prepare(`
                INSERT INTO invoice_items (invoice_id, medicine_id, quantity, unit_price, total_price)
                VALUES (@invoice_id, @medicine_id, @quantity, @unit_price, @total_price)
            `);
            const stockStmt = this.db.prepare('UPDATE medicines SET stock = stock - @quantity WHERE id = @medicine_id');

            for (const item of invoice.items) {
                this.run(itemStmt, { invoice_id: invoiceId, ...item });
                this.run(stockStmt, { quantity: item.quantity, medicine_id: item.medicine_id });
            }
            return invoiceId;
        });
        return transaction(invoiceData);
    }

    getAllInvoices() {
        const stmt = this.db.prepare('SELECT * FROM invoices ORDER BY created_at DESC');
        return this.all(stmt);
    }

    // --- Dashboard & Utility ---
    getDashboardStats() {
        const totalMedicines = this.get(this.db.prepare('SELECT COUNT(*) as count FROM medicines')).count;
        const lowStockItems = this.get(this.db.prepare('SELECT COUNT(*) as count FROM medicines WHERE stock < 10')).count;
        const totalInvoices = this.get(this.db.prepare('SELECT COUNT(*) as count FROM invoices')).count;
        const recentMedicines = this.all(this.db.prepare('SELECT * FROM medicines ORDER BY created_at DESC LIMIT 5'));
        return { totalMedicines, lowStockItems, totalInvoices, recentMedicines };
    }
    
    // --- THIS IS THE CORRECTED METHOD ---
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // **FIX**: Changed "now" to 'now' to use a string literal in SQL
        const stmt = this.db.prepare("SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) = DATE('now')");
        const todayCount = this.get(stmt).count + 1;
        
        return `INV-${year}${month}${day}-${String(todayCount).padStart(3, '0')}`;
    }

    close() {
        if (this.db) {
            this.db.close();
            console.log('Database connection closed.');
        }
    }
}

module.exports = DatabaseService;
