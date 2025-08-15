const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseService {
    constructor() {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'pharmacy.db');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.initializeTables();
    }

    initializeTables() {
        // Parties table with GSTIN
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS parties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                phone TEXT,
                address TEXT,
                gstin TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add GSTIN column if missing
        const partyCols = this.db.prepare("PRAGMA table_info(parties)").all();
        if (!partyCols.find(c => c.name.toLowerCase() === 'gstin')) {
            this.db.exec("ALTER TABLE parties ADD COLUMN gstin TEXT;");
        }

        // Suppliers table with GSTIN
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                phone TEXT,
                address TEXT,
                gstin TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add GSTIN column to suppliers if missing
        const supplierCols = this.db.prepare("PRAGMA table_info(suppliers)").all();
        if (!supplierCols.find(c => c.name.toLowerCase() === 'gstin')) {
            this.db.exec("ALTER TABLE suppliers ADD COLUMN gstin TEXT;");
        }

        // Medicines table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                batch_number TEXT,
                expiry_date TEXT,
                price REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Clients table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );
        `);

        // Sales reps table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sales_reps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );
        `);

        // Invoices table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE NOT NULL,
                client_id INTEGER,
                sales_rep_id INTEGER,
                total_amount REAL NOT NULL,
                tax REAL DEFAULT 0,
                final_amount REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients (id),
                FOREIGN KEY (sales_rep_id) REFERENCES sales_reps (id)
            )
        `);

        // Invoice items
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                medicine_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                free_quantity INTEGER DEFAULT 0,
                unit_price REAL NOT NULL,
                ptr REAL,
                total_price REAL NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices (id),
                FOREIGN KEY (medicine_id) REFERENCES medicines (id)
            )
        `);

        this.db.exec(`CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);`);
        console.log('Database tables initialized successfully');
    }

    // Parties CRUD
    getAllParties() {
        return this.db.prepare('SELECT * FROM parties ORDER BY name').all();
    }
    searchParties(searchTerm) {
        return this.db.prepare(`
            SELECT * FROM parties 
            WHERE name LIKE ? OR gstin LIKE ? 
            ORDER BY name
        `).all(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    addParty(party) {
        const stmt = this.db.prepare(`
            INSERT INTO parties (name, phone, address, gstin) 
            VALUES (@name, @phone, @address, @gstin)
        `);
        const result = stmt.run(party);
        return { id: result.lastInsertRowid, ...party };
    }
    updateParty(id, party) {
        const stmt = this.db.prepare(`
            UPDATE parties 
            SET name = @name, phone = @phone, address = @address, gstin = @gstin 
            WHERE id = @id
        `);
        return stmt.run({ id, ...party }).changes > 0;
    }
    deleteParty(id) {
        return this.db.prepare('DELETE FROM parties WHERE id = ?').run(id).changes > 0;
    }

    // Suppliers CRUD
    getAllSuppliers() {
        return this.db.prepare('SELECT * FROM suppliers ORDER BY name').all();
    }
    searchSuppliers(searchTerm) {
        return this.db.prepare(`
            SELECT * FROM suppliers 
            WHERE name LIKE ? OR gstin LIKE ? 
            ORDER BY name
        `).all(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    addSupplier(supplier) {
        const stmt = this.db.prepare(`
            INSERT INTO suppliers (name, phone, address, gstin) 
            VALUES (@name, @phone, @address, @gstin)
        `);
        const result = stmt.run(supplier);
        return { id: result.lastInsertRowid, ...supplier };
    }
    updateSupplier(id, supplier) {
        const stmt = this.db.prepare(`
            UPDATE suppliers 
            SET name = @name, phone = @phone, address = @address, gstin = @gstin 
            WHERE id = @id
        `);
        return stmt.run({ id, ...supplier }).changes > 0;
    }
    deleteSupplier(id) {
        return this.db.prepare('DELETE FROM suppliers WHERE id = ?').run(id).changes > 0;
    }

    // Clients CRUD
    getAllClients() {
        return this.db.prepare('SELECT * FROM clients ORDER BY name').all();
    }
    addClient(name) {
        const result = this.db.prepare('INSERT INTO clients (name) VALUES (?)').run(name);
        return { id: result.lastInsertRowid, name };
    }

    // Sales reps
    getAllSalesReps() {
        const reps = this.db.prepare('SELECT * FROM sales_reps ORDER BY name').all();
        if (reps.length === 0) {
            this.db.prepare("INSERT INTO sales_reps (name) VALUES ('Mr. John'), ('Ms. Jane')").run();
            return this.db.prepare('SELECT * FROM sales_reps ORDER BY name').all();
        }
        return reps;
    }

    // Invoices
    createInvoice(invoiceData) {
        const transaction = this.db.transaction((invoice) => {
            let client = this.db.prepare('SELECT id FROM clients WHERE name = ?').get(invoice.client_name);
            if (!client && invoice.client_name) {
                client = this.addClient(invoice.client_name);
            }

            const invoiceStmt = this.db.prepare(`
                INSERT INTO invoices (invoice_number, client_id, sales_rep_id, total_amount, tax, final_amount)
                VALUES (@invoice_number, @client_id, @sales_rep_id, @total_amount, @tax, @final_amount)
            `);
            const invoiceResult = invoiceStmt.run({
                ...invoice,
                client_id: client ? client.id : null
            });
            const invoiceId = invoiceResult.lastInsertRowid;

            const itemStmt = this.db.prepare(`
                INSERT INTO invoice_items (invoice_id, medicine_id, quantity, free_quantity, unit_price, ptr, total_price)
                VALUES (@invoice_id, @medicine_id, @quantity, @free_quantity, @unit_price, @ptr, @total_price)
            `);
            const stockStmt = this.db.prepare(`
                UPDATE medicines
                SET stock = stock - @total_deduction
                WHERE id = @medicine_id AND stock >= @total_deduction
            `);

            for (const item of invoice.items) {
                itemStmt.run({ invoice_id: invoiceId, ...item });
                const total_deduction = item.quantity + (item.free_quantity || 0);
                stockStmt.run({ total_deduction, medicine_id: item.medicine_id });
            }
            return invoiceId;
        });
        return transaction(invoiceData);
    }

    // Medicines CRUD
    getAllMedicines() {
        return this.db.prepare('SELECT * FROM medicines ORDER BY name').all();
    }
    searchMedicines(searchTerm) {
        return this.db.prepare('SELECT * FROM medicines WHERE name LIKE ? ORDER BY name').all(`%${searchTerm}%`);
    }
    addMedicine(medicine) {
        const result = this.db.prepare(`
            INSERT INTO medicines (name, batch_number, expiry_date, price, stock)
            VALUES (?, ?, ?, ?, ?)
        `).run(medicine.name, medicine.batch_number, medicine.expiry_date, medicine.price, medicine.stock);
        return { id: result.lastInsertRowid };
    }
    updateMedicine(id, medicine) {
        return this.db.prepare(`
            UPDATE medicines
            SET name = ?, batch_number = ?, expiry_date = ?, price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(medicine.name, medicine.batch_number, medicine.expiry_date, medicine.price, medicine.stock, id).changes > 0;
    }
    deleteMedicine(id) {
        return this.db.prepare('DELETE FROM medicines WHERE id = ?').run(id).changes > 0;
    }

    // Dashboard
    getDashboardStats() {
        const totalMedicines = this.db.prepare('SELECT COUNT(*) as count FROM medicines').get().count;
        const lowStockItems = this.db.prepare('SELECT COUNT(*) as count FROM medicines WHERE stock < 10').get().count;
        const totalInvoices = this.db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;
        const recentMedicines = this.db.prepare('SELECT * FROM medicines ORDER BY created_at DESC LIMIT 5').all();
        return { totalMedicines, lowStockItems, totalInvoices, recentMedicines };
    }

    // Invoice number generator
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const todayCount = this.db.prepare("SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) = DATE('now')").get().count + 1;
        return `INV-${year}${month}${day}-${String(todayCount).padStart(3, '0')}`;
    }

    close() {
        this.db.close();
    }
}

module.exports = DatabaseService;
