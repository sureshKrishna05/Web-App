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
                name TEXT NOT NULL UNIQUE,
                dob TEXT,
                contact_number TEXT,
                employee_type TEXT,
                date_of_joining TEXT
            );
        `);

        // Table for Sales Rep Targets
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sales_targets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rep_id INTEGER NOT NULL,
                month TEXT NOT NULL, -- Format: YYYY-MM
                target_amount REAL NOT NULL,
                achieved_amount REAL DEFAULT 0,
                FOREIGN KEY (rep_id) REFERENCES sales_reps (id) ON DELETE CASCADE,
                UNIQUE(rep_id, month)
            );
        `);

        // Invoices table - UPDATED with status and payment_mode
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE NOT NULL,
                client_id INTEGER,
                sales_rep_id INTEGER,
                total_amount REAL NOT NULL,
                tax REAL DEFAULT 0,
                final_amount REAL NOT NULL,
                payment_mode TEXT,
                status TEXT DEFAULT 'Draft',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES parties (id),
                FOREIGN KEY (sales_rep_id) REFERENCES sales_reps (id) ON DELETE SET NULL
            )
        `);

        // Invoice items table - UPDATED with hsn
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                medicine_id INTEGER NOT NULL,
                hsn TEXT,
                quantity INTEGER NOT NULL,
                free_quantity INTEGER DEFAULT 0,
                unit_price REAL NOT NULL,
                ptr REAL,
                total_price REAL NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
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
    getPartyByName(name) {
        return this.db.prepare('SELECT * FROM parties WHERE name = ?').get(name);
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
        return this.db.prepare('SELECT * FROM sales_reps ORDER BY name').all();
    }

    addSalesRep(employee) {
        const stmt = this.db.prepare(`
            INSERT INTO sales_reps (name, dob, contact_number, employee_type, date_of_joining) 
            VALUES (@name, @dob, @contact_number, @employee_type, @date_of_joining)
        `);
        const result = stmt.run(employee);
        return { id: result.lastInsertRowid, ...employee };
    }

    deleteSalesRep(id) {
        return this.db.prepare('DELETE FROM sales_reps WHERE id = ?').run(id).changes > 0;
    }


    // --- Employee/Sales Rep Performance ---
    getRepPerformance(repId, month) {
        const stmt = this.db.prepare(`
            SELECT 
                s.name,
                COALESCE(st.target_amount, 0) as target,
                COALESCE(st.achieved_amount, 0) as achieved
            FROM sales_reps s
            LEFT JOIN sales_targets st ON s.id = st.rep_id AND st.month = ?
            WHERE s.id = ?
            GROUP BY s.id
        `);
        return stmt.get(month, repId);
    }
    
    setRepTarget(repId, month, targetAmount) {
        const stmt = this.db.prepare(`
            INSERT INTO sales_targets (rep_id, month, target_amount, achieved_amount) 
            VALUES (?, ?, ?, 0)
            ON CONFLICT(rep_id, month) 
            DO UPDATE SET target_amount = excluded.target_amount;
        `);
        return stmt.run(repId, month, targetAmount);
    }

    // ---------------- Invoices ----------------
    createInvoice(invoiceData) {
        const transaction = this.db.transaction((invoice) => {
            let partyId = invoice.client_id;
            if (!partyId && invoice.client_name) {
                let party = this.db.prepare('SELECT id FROM parties WHERE name = ?').get(invoice.client_name);
                if (!party) {
                    party = this.addParty({ name: invoice.client_name, phone: '', address: '', gstin: '' });
                }
                partyId = party.id;
            }

            const invoiceStmt = this.db.prepare(`
                INSERT INTO invoices (invoice_number, client_id, sales_rep_id, total_amount, tax, final_amount, payment_mode, status)
                VALUES (@invoice_number, @client_id, @sales_rep_id, @total_amount, @tax, @final_amount, @payment_mode, @status)
            `);
            const invoiceResult = invoiceStmt.run({
                ...invoice,
                client_id: partyId
            });
            const invoiceId = invoiceResult.lastInsertRowid;

            const itemStmt = this.db.prepare(`
                INSERT INTO invoice_items (invoice_id, medicine_id, hsn, quantity, free_quantity, unit_price, ptr, total_price)
                VALUES (@invoice_id, @medicine_id, @hsn, @quantity, @free_quantity, @unit_price, @ptr, @total_price)
            `);
            
            for (const item of invoice.items) {
                itemStmt.run({ invoice_id: invoiceId, ...item });
            }

            if (invoice.status === 'Completed') {
                const stockStmt = this.db.prepare(`
                    UPDATE medicines SET stock = stock - @total_deduction
                    WHERE id = @medicine_id AND stock >= @total_deduction
                `);

                for (const item of invoice.items) {
                    const total_deduction = item.quantity + (item.free_quantity || 0);
                    stockStmt.run({ total_deduction, medicine_id: item.medicine_id });
                }

                if (invoice.sales_rep_id) {
                    const month = new Date().toISOString().slice(0, 7);
                    const updateTargetStmt = this.db.prepare(`
                        INSERT INTO sales_targets (rep_id, month, target_amount, achieved_amount)
                        VALUES (@rep_id, @month, 0, @final_amount)
                        ON CONFLICT(rep_id, month)
                        DO UPDATE SET achieved_amount = achieved_amount + excluded.achieved_amount;
                    `);
                    updateTargetStmt.run({
                        rep_id: invoice.sales_rep_id,
                        month: month,
                        final_amount: invoice.final_amount
                    });
                }
            }

            return invoiceId;
        });
        return transaction(invoiceData);
    }

    getFilteredInvoices(filters) {
        let query = `
            SELECT 
                i.id, 
                i.invoice_number, 
                i.final_amount, 
                i.created_at, 
                i.status,
                p.name as client_name,
                sr.name as rep_name
            FROM invoices i
            LEFT JOIN parties p ON i.client_id = p.id
            LEFT JOIN sales_reps sr ON i.sales_rep_id = sr.id
        `;
    
        const whereClauses = [];
        const params = [];
    
        if (filters.clientId) {
            whereClauses.push('i.client_id = ?');
            params.push(filters.clientId);
        }
        if (filters.repId) {
            whereClauses.push('i.sales_rep_id = ?');
            params.push(filters.repId);
        }
        if (filters.month) {
            whereClauses.push("strftime('%Y-%m', i.created_at) = ?");
            params.push(filters.month);
        }
        if (filters.status) {
            whereClauses.push('i.status = ?');
            params.push(filters.status);
        }
    
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }
    
        query += ' ORDER BY i.created_at DESC';
    
        return this.db.prepare(query).all(params);
    }
    
    getInvoiceDetails(invoiceId) {
        const invoice = this.db.prepare(`
            SELECT 
                i.*, 
                p.name as client_name,
                p.address as client_address,
                p.phone as client_phone
            FROM invoices i
            LEFT JOIN parties p ON i.client_id = p.id
            WHERE i.id = ?
        `).get(invoiceId);

        if (invoice) {
            invoice.items = this.db.prepare(`
                SELECT 
                    ii.*,
                    m.name as medicine_name,
                    m.hsn,
                    m.batch_number,
                    m.expiry_date
                FROM invoice_items ii
                JOIN medicines m ON ii.medicine_id = m.id
                WHERE ii.invoice_id = ?
            `).all(invoiceId);
        }
        return invoice;
    }

    getInvoicesForExport(invoiceIds) {
        const query = `
            SELECT
                i.invoice_number,
                i.created_at,
                p.name as client_name,
                sr.name as rep_name,
                m.name as medicine_name,
                m.hsn,
                ii.quantity,
                ii.free_quantity,
                ii.unit_price,
                ii.total_price
            FROM invoices i
            LEFT JOIN parties p ON i.client_id = p.id
            LEFT JOIN sales_reps sr ON i.sales_rep_id = sr.id
            JOIN invoice_items ii ON i.id = ii.invoice_id
            JOIN medicines m ON ii.medicine_id = m.id
            WHERE i.id IN (${invoiceIds.map(() => '?').join(',')})
            ORDER BY i.invoice_number, m.name
        `;
        return this.db.prepare(query).all(invoiceIds);
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
        const totalInvoices = this.db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'Completed'").get().count;
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

