# Billing & Inventory Management Web App

A **web-based billing and stock management system** built with **React + Express + SQLite**, designed for small and medium businesses running on a local network or single machine. The app provides easy billing, inventory tracking, GST-ready invoicing, reporting, and data backup/restore, accessible via a web browser.

---

## ✨ Features  
- 🧾 **Invoice Management**  
  - Create, edit, and print GST-compliant invoices  
  - Auto-generate unique invoice numbers  

- 📦 **Inventory Management**  
  - Add/edit items with HSN, batch number, expiry date, and stock tracking  
  - Group items by **HSN Code** with common **GST %** for consistency  

- 👥 **Parties & Suppliers**  
  - Manage customers and suppliers with GSTIN, phone, and address  

- 📊 **Reports & Dashboard**  
  - Low stock alerts  
  - Recent activity view  
  - Sales representative performance tracking  

- ⚡ **Tech Stack**
    - Frontend: **React + TailwindCSS + Vite**
    - Backend: **Node.js + Express**
    - Database: **SQLite (better-sqlite3)** for local data persistence

---

## 🚀 Getting Started  

### Prerequisites  
- [Node.js](https://nodejs.org/) >= 16  
- npm or yarn  

### Installation  
```bash
# Clone the repo
git clone https://github.com/sureshKrishna05/billing-app.git
cd billing-app

# Install dependencies
npm install
```

### Development  
Run in development mode with hot reload:  
```bash
npm run dev
```

### Build  
Package the app for your platform:  
```bash
npm run build
```

Build outputs will be available under `dist/`.  

---

## 📂 Project Structure  

```
billing-app/
├── main.js                # Express backend API server entry point
├── data/                  # Contains the SQLite database file (pharmacy.db)
├── dist/                  # Build output directory (created by `npm run build`)
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # React components for each main page/view
│   ├── database/
│   │   └── database.js    # SQLite database service logic
│   ├── utils/
│   │   └── invoiceGenerator.js # PDF generation logic
│   ├── assets/            # Static assets like images/SVGs
│   ├── App.jsx            # Main React application component
│   ├── main.jsx           # React application entry point
│   └── index.css          # Main CSS file importing Tailwind
├── index.html             # HTML entry point for Vite
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # TailwindCSS configuration
├── postcss.config.js      # PostCSS configuration
├── package.json           # Project metadata and dependencies
├── .gitignore             # Specifies intentionally untracked files
└── README.md              # This file
```

---

## 🧩 Key Modules

- **`main.js`** → Express server handling API requests for CRUD operations, PDF generation, backup/restore.
- **`src/database/database.js`** → Manages SQLite schema, database connection, and all data access logic (items, invoices, groups, parties, settings etc.).
- **`src/pages/BillingPage.jsx`** → UI for creating new invoices.
- **`src/pages/ItemsPage.jsx`** → UI for viewing/adding/editing/deleting inventory items.
- **`src/components/AddItemModal.jsx`** → Modal form for adding or editing items, includes logic for handling HSN groups.
- **`src/pages/GroupsPage.jsx`** → UI for managing item groups by HSN code.
- **`src/pages/SettingsPage.jsx`** → UI for updating company settings and performing database backup/restore.
- **`src/utils/invoiceGenerator.js`** → Uses `pdfkit` to generate PDF documents for invoices.

---

## 🛠️ Future Enhancements  
- Cloud backup & sync  
- Multi-user support with roles/permissions  
- Advanced reporting & analytics  
- QR code on invoices for quick validation  

---

## 📜 License  
This project is licensed under the MIT License.  
