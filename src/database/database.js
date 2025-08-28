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
        // Parties table (for customers)
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

        // Suppliers table
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

        // Medicines table (now the single source for inventory)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                hsn TEXT,
                item_code TEXT UNIQUE,
                batch_number TEXT,
                expiry_date TEXT,
                price REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Sales reps table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sales_reps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );
        `);

        // --- NEW: Table for Sales Rep Targets ---
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sales_targets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rep_id INTEGER NOT NULL,
                month TEXT NOT NULL, -- Format: YYYY-MM
                target_amount REAL NOT NULL,
                achieved_amount REAL DEFAULT 0,
                FOREIGN KEY (rep_id) REFERENCES sales_reps (id),
                UNIQUE(rep_id, month)
            );
        `);

        // Invoices table (now correctly linked to 'parties')
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
                FOREIGN KEY (client_id) REFERENCES parties (id),
                FOREIGN KEY (sales_rep_id) REFERENCES sales_reps (id)
            )
        `);

        // Invoice items table
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

    // ---------------- Parties (Customers) CRUD ----------------
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

    // ---------------- Suppliers CRUD ----------------
    getAllSuppliers() {
        return this.db.prepare('SELECT * FROM suppliers ORDER BY name').all();
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

    // ---------------- Sales reps ----------------
    getAllSalesReps() {
        const reps = this.db.prepare('SELECT * FROM sales_reps ORDER BY name').all();
        if (reps.length === 0) {
            this.db.prepare("INSERT INTO sales_reps (name) VALUES ('Mr. John'), ('Ms. Jane')").run();
            return this.db.prepare('SELECT * FROM sales_reps ORDER BY name').all();
        }
        return reps;
    }

    // --- NEW: Methods for Employee/Sales Rep Performance ---
    getRepPerformance(repId, month) { // month in YYYY-MM format
        const stmt = this.db.prepare(`
            SELECT 
                s.name,
                COALESCE(st.target_amount, 0) as target,
                COALESCE(SUM(i.final_amount), 0) as achieved
            FROM sales_reps s
            LEFT JOIN invoices i ON s.id = i.sales_rep_id AND strftime('%Y-%m', i.created_at) = ?
            LEFT JOIN sales_targets st ON s.id = st.rep_id AND st.month = ?
            WHERE s.id = ?
            GROUP BY s.id
        `);
        return stmt.get(month, month, repId);
    }
    
    setRepTarget(repId, month, targetAmount) {
        const stmt = this.db.prepare(`
            INSERT INTO sales_targets (rep_id, month, target_amount) 
            VALUES (?, ?, ?)
            ON CONFLICT(rep_id, month) 
            DO UPDATE SET target_amount = excluded.target_amount;
        `);
        return stmt.run(repId, month, targetAmount);
    }

    // ---------------- Invoices ----------------
    createInvoice(invoiceData) {
        const transaction = this.db.transaction((invoice) => {
            let party = this.db.prepare('SELECT id FROM parties WHERE name = ?').get(invoice.client_name);
            if (!party && invoice.client_name) {
                party = this.addParty({ name: invoice.client_name, phone: '', address: '', gstin: '' });
            }

            const invoiceStmt = this.db.prepare(`
                INSERT INTO invoices (invoice_number, client_id, sales_rep_id, total_amount, tax, final_amount)
                VALUES (@invoice_number, @client_id, @sales_rep_id, @total_amount, @tax, @final_amount)
            `);
            const invoiceResult = invoiceStmt.run({
                ...invoice,
                client_id: party ? party.id : null
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

    // ---------------- Medicines CRUD ----------------
    getAllMedicines() {
        return this.db.prepare('SELECT * FROM medicines ORDER BY name').all();
    }
    searchMedicines(searchTerm) {
        return this.db.prepare('SELECT * FROM medicines WHERE name LIKE ? ORDER BY name').all(`%${searchTerm}%`);
    }
    addMedicine(medicine) {
        const stmt = this.db.prepare(`
            INSERT INTO medicines (name, hsn, batch_number, expiry_date, price, stock)
            VALUES (@name, @hsn, @batch_number, @expiry_date, @price, @stock)
        `);
        const result = stmt.run(medicine);
        const newItemId = result.lastInsertRowid;
        
        // Auto-generate and set the item_code based on the new ID
        const itemCode = `ITEM-${String(newItemId).padStart(4, '0')}`;
        this.db.prepare('UPDATE medicines SET item_code = ? WHERE id = ?').run(itemCode, newItemId);
        
        return { id: newItemId };
    }
    updateMedicine(id, medicine) {
        return this.db.prepare(`
            UPDATE medicines
            SET name = @name, hsn = @hsn, batch_number = @batch_number, expiry_date = @expiry_date, 
            price = @price, stock = @stock, updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `).run({ id, ...medicine }).changes > 0;
    }
    deleteMedicine(id) {
        return this.db.prepare('DELETE FROM medicines WHERE id = ?').run(id).changes > 0;
    }

    // ---------------- Dashboard & Utilities ----------------
    getDashboardStats() {
        const totalMedicines = this.db.prepare('SELECT COUNT(*) as count FROM medicines').get().count;
        const lowStockItems = this.db.prepare('SELECT COUNT(*) as count FROM medicines WHERE stock < 10').get().count;
        const totalInvoices = this.db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;
        const recentMedicines = this.db.prepare('SELECT * FROM medicines ORDER BY created_at DESC LIMIT 5').all();
        return { totalMedicines, lowStockItems, totalInvoices, recentMedicines };
    }

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
