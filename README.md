Pharma-Billing: Desktop Billing & Inventory Management App
Pharma-Billing is a modern, offline-first desktop application designed for pharmacies and small businesses to manage their billing, inventory, and sales operations efficiently. Built with a powerful combination of Electron and React, it offers a fast, responsive, and native desktop experience.

✨ Features
This application is packed with features to streamline business operations:

Dashboard
At-a-Glance Analytics: Instantly view key metrics like total items in inventory, low-stock alerts, and the total number of invoices generated.

Quick Navigation: Clickable stat cards take you directly to the relevant sections of the app.

Recent Activity: See a list of the most recently added items.

Billing & Invoicing
Dynamic Invoice Creation: Easily create new invoices and estimates (quotations).

Smart Client Search: Search for existing clients or add new ones on the fly.

Automated Tax Calculation: GST is automatically calculated for each item based on its pre-configured HSN group.

Backend PDF Generation: Create professional, pixel-perfect PDF invoices and quotations using pdfkit for a consistent look on all platforms.

Direct Printing: Print invoices and estimates directly to any connected printer from the billing page.

Sales & Reporting
Comprehensive Sales History: View a filterable list of all past invoices and estimates.

Advanced Filtering: Filter sales records by client, sales representative, date (month/year), and status (Completed/Estimate).

Individual Invoice Download: Download a PDF copy of any past invoice directly from the sales history page.

Bulk Data Export: Export filtered sales data to CSV or Excel (XLSX) for accounting and analysis.

Inventory & Product Management
Item Management: Add, edit, and delete inventory items (medicines) with details like batch number, expiry date, price, and stock levels.

HSN-Based Grouping: Organize items into groups based on their HSN code to manage GST rates centrally.

Interactive Group Management: View items within a group, and update the GST percentage for all items in that group from a single, intuitive modal.

Contact Management
Clients (Parties): Maintain a detailed database of your clients.

Suppliers: Keep a record of all your suppliers.

Employees: Manage your sales representatives, including their personal and employment details.

🚀 Tech Stack
This project is built with a modern and robust set of technologies:

Framework: Electron for building the cross-platform desktop application.

Frontend: React (with Vite) for a fast and reactive user interface.

Styling: Tailwind CSS for a utility-first, modern design.

Database: better-sqlite3 for a fast, local, file-based SQLite database. No external database server is required.

PDF Generation: PDFKit for creating professional, high-quality invoices and quotations on the backend.

⚙️ Getting Started
Follow these instructions to get a local copy up and running for development purposes.

Prerequisites
You need to have Node.js and npm installed on your machine.

Installation & Setup
Clone the repository:

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

Install NPM packages:
This will install all the necessary dependencies for both Electron and React.

npm install

Run the application in development mode:
This command will start the Vite development server for the React UI and launch the Electron application. It supports Hot-Module Replacement (HMR) for a smooth development experience.

npm run dev

(or npm start)

📦 Building the Application
To package the application into a distributable format (e.g., an .exe for Windows or a .dmg for macOS), run the following command:

npm run make

This command uses electron-forge to build the application. The final, installable files will be located in the out directory.

Project Structure
/
├── main.js                 # Electron main process entry point & backend logic
├── preload.js              # Security bridge between main and renderer processes
├── package.json            # Project dependencies and scripts
│
└── src/
    ├── App.jsx             # Main React application component with routing
    ├── database/
    │   └── database.js     # All SQLite database logic (schema, CRUD operations)
    ├── utils/
    │   └── invoiceGenerator.js # Backend PDF generation logic using PDFKit
    ├── pages/              # React components for each main page (Billing, Dashboard, etc.)
    └── components/         # Reusable React components (Modals, Icons, etc.)
