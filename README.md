# Billing & Inventory Management App  

A **desktop billing and stock management system** built with **Electron + React + SQLite**, designed for small and medium businesses. The app provides easy billing, inventory tracking, GST-ready invoicing, and reporting, all in a lightweight cross-platform package.  

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
  - Frontend: **Electron + React + TailwindCSS**  
  - Backend: **SQLite (better-sqlite3)** for offline-first performance  
  - IPC communication for database access  

---

## 🚀 Getting Started  

### Prerequisites  
- [Node.js](https://nodejs.org/) >= 16  
- npm or yarn  

### Installation  
```bash
# Clone the repo
git clone https://github.com/yourusername/billing-app.git
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
├── main.js                # Electron entry point
├── preload.js             # IPC bridge
├── src/
│   ├── components/        # React components
│   ├── pages/             # App pages (Billing, Items, Groups, etc.)
│   ├── database.js        # SQLite database service
│   └── styles/            # Tailwind styles
├── assets/                # Icons & static files
└── docs/                  # Documentation & screenshots
```

---

## 🧩 Key Modules  

- **`database.js`** → Handles SQLite schema & CRUD (items, invoices, groups, parties)  
- **`AddItemModal.jsx`** → Add or edit items, auto-fill GST & HSN groups  
- **`GroupsPage.jsx`** → Manage item groups by HSN code  
- **`ItemsPage.jsx`** → View/edit/delete inventory items  
- **`InvoicesPage.jsx`** → Create & print invoices  

---

## 🛠️ Future Enhancements  
- Cloud backup & sync  
- Multi-user support with roles/permissions  
- Advanced reporting & analytics  
- QR code on invoices for quick validation  

---

## 📜 License  
This project is licensed under the MIT License.  
