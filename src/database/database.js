
const path = require('path');
const { app } = require('electron');
const isDev = !app.isPackaged;
const Database = require('better-sqlite3');

class DatabaseService {
    constructor() {
        const userDataPath = app.getPath('userData');
        this.dbPath = path.join(userDataPath, 'pharmacy.db'); // Store path for backup/restore
        this.db = new Database(this.dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.initializeTables();
    }

    /**
     * Returns the absolute path to the database file.
     * Required for the backup/restore functionality.
     */
    getDbPath() {
        return this.dbPath;
    }

    initializeTables() {
        // --- Core Entity Tables ---
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
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS item_groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hsn_code TEXT NOT NULL UNIQUE,
                gst_percentage REAL NOT NULL DEFAULT 0
            );
        `);
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
                group_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES item_groups (id) ON DELETE SET NULL
            );
        `);
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
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sales_targets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rep_id INTEGER NOT NULL,
                month TEXT NOT NULL, /* YYYY-MM format */
                target_amount REAL NOT NULL,
                achieved_amount REAL DEFAULT 0,
                FOREIGN KEY (rep_id) REFERENCES sales_reps (id) ON DELETE CASCADE,
                UNIQUE(rep_id, month)
            );
        `);

        // --- Transactional Tables (Invoices & Quotations) ---
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
                status TEXT DEFAULT 'Estimate', /* e.g., 'Estimate', 'Completed' */
                FOREIGN KEY (client_id) REFERENCES parties (id),
                FOREIGN KEY (sales_rep_id) REFERENCES sales_reps (id) ON DELETE SET NULL
            )
        `);
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
                FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
                FOREIGN KEY (medicine_id) REFERENCES medicines (id)
            )
        `);
        // NEW: Quotation tables mirroring invoices
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS quotations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quotation_number TEXT UNIQUE NOT NULL,
                client_id INTEGER,
                sales_rep_id INTEGER,
                total_amount REAL NOT NULL,
                tax REAL DEFAULT 0,
                final_amount REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES parties (id),
                FOREIGN KEY (sales_rep_id) REFERENCES sales_reps (id) ON DELETE SET NULL
            );
        `);
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS quotation_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quotation_id INTEGER NOT NULL,
                medicine_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                free_quantity INTEGER DEFAULT 0,
                unit_price REAL NOT NULL,
                ptr REAL,
                total_price REAL NOT NULL,
                FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE,
                FOREIGN KEY (medicine_id) REFERENCES medicines (id)
            );
        `);
        
        // --- Settings Table ---
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                company_name TEXT,
                address TEXT,
                phone TEXT,
                gstin TEXT,
                footer_text TEXT
            );
        `);
        
        this.db.exec(`CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);`);
        console.log('Database tables initialized successfully');
    }

    // ---------------- Settings CRUD ----------------
    getSettings() {
        let settings = this.db.prepare('SELECT * FROM settings WHERE id = 1').get();
        if (!settings) {
            // If no settings row exists, create a default one
            this.db.prepare('INSERT INTO settings (id) VALUES (1)').run();
            settings = this.db.prepare('SELECT * FROM settings WHERE id = 1').get();
        }
        return settings;
    }

    updateSettings(settings) {
        const stmt = this.db.prepare(`
            INSERT INTO settings (id, company_name, address, phone, gstin, footer_text)
            VALUES (1, @company_name, @address, @phone, @gstin, @footer_text)
            ON CONFLICT(id) DO UPDATE SET
                company_name = excluded.company_name,
                address = excluded.address,
                phone = excluded.phone,
                gstin = excluded.gstin,
                footer_text = excluded.footer_text;
        `);
        return stmt.run(settings);
    }

    // --- (The rest of your existing functions remain here) ---
    // ---------------- Parties (Customers) CRUD ----------------
    getAllParties() {
        return this.db.prepare('SELECT * FROM parties ORDER BY name').all();
    }
    getPartyById(id) {
        return this.db.prepare('SELECT * FROM parties WHERE id = ?').get(id);
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

    // --- Group Management Functions (Updated) ---
    getAllGroups() {
        return this.db.prepare(`
            SELECT 
                ig.id, 
                ig.hsn_code, 
                ig.gst_percentage,
                COUNT(m.id) as itemCount
            FROM item_groups ig
            LEFT JOIN medicines m ON ig.id = m.group_id
            GROUP BY ig.id
            ORDER BY ig.hsn_code
        `).all();
    }
    
    getGroupDetails(id) {
        const group = this.db.prepare('SELECT * FROM item_groups WHERE id = ?').get(id);
        if (group) {
            group.medicines = this.db.prepare('SELECT id, name FROM medicines WHERE group_id = ? ORDER BY name').all(id);
        }
        return group;
    }

    getGroupByHSN(hsn) {
        return this.db.prepare('SELECT * FROM item_groups WHERE hsn_code = ?').get(hsn);
    }
    addGroup({ hsn_code, gst_percentage = 0 }) {
        const stmt = this.db.prepare('INSERT INTO item_groups (hsn_code, gst_percentage) VALUES (?, ?)');
        const result = stmt.run(hsn_code, gst_percentage);
        return { id: result.lastInsertRowid, hsn_code, gst_percentage };
    }
    updateGroupGst(id, gst_percentage) {
        return this.db.prepare('UPDATE item_groups SET gst_percentage = ? WHERE id = ?').run(gst_percentage, id).changes > 0;
    }

    deleteGroup(id) {
        const itemCheck = this.db.prepare('SELECT COUNT(*) as count FROM medicines WHERE group_id = ?').get(id);
        if (itemCheck.count > 0) {
            throw new Error(`Cannot delete group. It is currently assigned to ${itemCheck.count} item(s).`);
        }
        return this.db.prepare('DELETE FROM item_groups WHERE id = ?').run(id).changes > 0;
    }

    // ---------------- Invoices ----------------
    createInvoice(invoiceData) {
        const transaction = this.db.transaction((invoice) => {
            let partyId = invoice.client_id;
            if (!partyId && invoice.client_name) {
                let party = this.getPartyByName(invoice.client_name);
                if (!party) {
                    party = this.addParty({ name: invoice.client_name, phone: '', address: '', gstin: '' });
                }
                partyId = party.id;
            }

            const invoiceStmt = this.db.prepare(`
                INSERT INTO invoices (invoice_number, client_id, sales_rep_id, total_amount, tax, final_amount, status)
                VALUES (@invoice_number, @client_id, @sales_rep_id, @total_amount, @tax, @final_amount, @status)
            `);
            const invoiceResult = invoiceStmt.run({
                ...invoice,
                client_id: partyId
            });
            const invoiceId = invoiceResult.lastInsertRowid;

            const itemStmt = this.db.prepare(`
                INSERT INTO invoice_items (invoice_id, medicine_id, quantity, free_quantity, unit_price, ptr, total_price)
                VALUES (@invoice_id, @medicine_id, @quantity, @free_quantity, @unit_price, @ptr, @total_price)
            `);
            
            if (invoice.status === 'Completed') {
                const stockStmt = this.db.prepare(`
                    UPDATE medicines
                    SET stock = stock - @total_deduction
                    WHERE id = @medicine_id AND stock >= @total_deduction
                `);
                
                for (const item of invoice.items) {
                    itemStmt.run({ invoice_id: invoiceId, ...item });
                    const total_deduction = item.quantity + (item.free_quantity || 0);
                    const stockUpdateResult = stockStmt.run({ total_deduction, medicine_id: item.medicine_id });
                    if (stockUpdateResult.changes === 0) {
                        throw new Error(`Insufficient stock for item: ${item.name}.`);
                    }
                }

                if (invoice.sales_rep_id) {
                    const month = new Date(invoice.created_at || Date.now()).toISOString().slice(0, 7);
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
            } else { // For 'Estimate' status
                 for (const item of invoice.items) {
                    itemStmt.run({ invoice_id: invoiceId, ...item });
                }
            }
            return invoiceId;
        });
        return transaction(invoiceData);
    }

    getInvoiceDetails(invoiceId) {
        const invoice = this.db.prepare(`
            SELECT 
                i.*, 
                p.name as client_name,
                p.address as client_address,
                p.phone as client_phone,
                p.gstin as client_gstin
            FROM invoices i
            LEFT JOIN parties p ON i.client_id = p.id
            WHERE i.id = ?
        `).get(invoiceId);

        if (invoice) {
            invoice.items = this.db.prepare(`
                SELECT 
                    ii.*,
                    m.name as medicine_name
                FROM invoice_items ii
                JOIN medicines m ON ii.medicine_id = m.id
                WHERE ii.invoice_id = ?
            `).all(invoiceId);
        }
        return invoice;
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

        if (filters.clientId) { whereClauses.push('i.client_id = ?'); params.push(filters.clientId); }
        if (filters.repId) { whereClauses.push('i.sales_rep_id = ?'); params.push(filters.repId); }
        if (filters.month) { whereClauses.push("strftime('%Y-%m', i.created_at) = ?"); params.push(filters.month); }
        if (filters.status) { whereClauses.push('i.status = ?'); params.push(filters.status); }

        if (whereClauses.length > 0) { query += ' WHERE ' + whereClauses.join(' AND '); }
        query += ' ORDER BY i.created_at DESC';

        return this.db.prepare(query).all(params);
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

    // ---------------- NEW: Quotations ----------------
    /**
     * Retrieves the details for a single quotation, including its items.
     * @param {number} quotationId The ID of the quotation to retrieve.
     */
    getQuotationDetails(quotationId) {
        const quotation = this.db.prepare(`
            SELECT 
                q.*, 
                p.name as client_name,
                p.address as client_address,
                p.phone as client_phone
            FROM quotations q
            LEFT JOIN parties p ON q.client_id = p.id
            WHERE q.id = ?
        `).get(quotationId);

        if (quotation) {
            quotation.items = this.db.prepare(`
                SELECT 
                    qi.*,
                    m.name as medicine_name
                FROM quotation_items qi
                JOIN medicines m ON qi.medicine_id = m.id
                WHERE qi.quotation_id = ?
            `).all(quotationId);
        }
        return quotation;
    }


    // ---------------- Medicines CRUD ----------------
    getAllMedicines() {
        return this.db.prepare(`
            SELECT 
                m.*, 
                ig.gst_percentage
            FROM medicines m
            LEFT JOIN item_groups ig ON m.group_id = ig.id
            ORDER BY m.name
        `).all();
    }
    searchMedicines(searchTerm) {
        return this.db.prepare(`
            SELECT 
                m.*,
                ig.gst_percentage
            FROM medicines m
            LEFT JOIN item_groups ig ON m.group_id = ig.id
            WHERE m.name LIKE ? 
            ORDER BY m.name
        `).all(`%${searchTerm}%`);
    }
    addMedicine(medicine) {
        let groupId = null;
        if (medicine.hsn) {
            let group = this.getGroupByHSN(medicine.hsn);
            if (!group) {
                const result = this.db.prepare('INSERT INTO item_groups (hsn_code, gst_percentage) VALUES (?, ?)')
                                     .run(medicine.hsn, medicine.gst_percentage || 0);
                groupId = result.lastInsertRowid;
            } else {
                groupId = group.id;
            }
        }

        const stmt = this.db.prepare(`
            INSERT INTO medicines (name, hsn, batch_number, expiry_date, price, stock, group_id)
            VALUES (@name, @hsn, @batch_number, @expiry_date, @price, @stock, @group_id)
        `);
        const result = stmt.run({ ...medicine, group_id: groupId });
        const newItemId = result.lastInsertRowid;

        const itemCode = `ITEM-${String(newItemId).padStart(4, '0')}`;
        this.db.prepare('UPDATE medicines SET item_code = ? WHERE id = ?').run(itemCode, newItemId);

        return { id: newItemId };
    }
    updateMedicine(id, medicine) {
        let groupId = null;
        if (medicine.hsn) {
            let group = this.getGroupByHSN(medicine.hsn);
            if (!group && typeof medicine.gst_percentage !== 'undefined') {
                const res = this.db.prepare('INSERT INTO item_groups (hsn_code, gst_percentage) VALUES (?, ?)')
                                      .run(medicine.hsn, medicine.gst_percentage || 0);
                groupId = res.lastInsertRowid;
            } else if (group) {
                groupId = group.id;
            }
        }

        const stmt = this.db.prepare(`
            UPDATE medicines
            SET name = @name,
                hsn = @hsn,
                batch_number = @batch_number,
                expiry_date = @expiry_date,
                price = @price,
                stock = @stock,
                group_id = COALESCE(@group_id, group_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `);
        return stmt.run({ id, ...medicine, group_id: groupId }).changes > 0;
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

checkpointDb() {
        // This forces a full checkpoint of the WAL file to the main database.
        return this.db.pragma('wal_checkpoint(FULL)');
    }

    close() {
        this.db.close();
    }
}

module.exports = DatabaseService;
