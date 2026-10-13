# Smart Inventory & Daily Sales Management System

A modern, responsive, secure, and user-friendly web-based Inventory and Daily Sales Management System for retail businesses. Built with **PHP 8+**, **MySQL**, **PDO**, and **Bootstrap 5 / Tailwind**.

---

## 🚀 Beginner-Friendly XAMPP Installation Guide (10 Steps)

Follow these 10 step-by-step instructions to set up and run this project locally on your machine with XAMPP:

### Step 1: Install XAMPP
1. Download **XAMPP for Windows / macOS / Linux** from the official Apache Friends website: [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Choose a version with **PHP 8.1 or higher**.
3. Run the installer and select the core components: **Apache**, **MySQL**, and **phpMyAdmin**.

---

### Step 2: Copy the Project Folder into `htdocs`
1. Navigate to your XAMPP installation directory:
   - **Windows:** `C:\xampp\htdocs\`
   - **macOS:** `/Applications/XAMPP/xamppfiles/htdocs/`
   - **Linux:** `/opt/lampp/htdocs/`
2. Create a folder named `inventory_management` inside `htdocs`.
3. Copy all project files (all PHP files, folders `config/`, `includes/`, `assets/`, and `database/`) into:
   ```
   C:\xampp\htdocs\inventory_management\
   ```

---

### Step 3: Start Apache and MySQL
1. Open the **XAMPP Control Panel**.
2. Click the **Start** button next to **Apache**. (The module should turn green).
3. Click the **Start** button next to **MySQL**. (The module should turn green).

---

### Step 4: Open phpMyAdmin
1. Open your web browser (Chrome, Edge, Firefox, or Safari).
2. Visit: [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)

---

### Step 5: Create the Database
1. In phpMyAdmin, click on the **Databases** tab in the top navigation bar.
2. Under "Create database", enter the database name:
   ```
   inventory_management
   ```
3. Choose collation: `utf8mb4_unicode_ci`.
4. Click the **Create** button.

---

### Step 6: Import the SQL File
1. In phpMyAdmin's left sidebar, click on your newly created `inventory_management` database.
2. Click on the **Import** tab at the top.
3. Click **Choose File** (or Browse) and select the file:
   ```
   database/inventory_management.sql
   ```
4. Scroll to the bottom and click the **Import** button.
5. You will see a success message: *"Import has been successfully finished. 5 queries executed."*

---

### Step 7: Configure Database Credentials
Open `config/database.php` in a text editor (e.g., VS Code or Notepad).
By default, standard XAMPP settings are already configured:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'inventory_management');
define('DB_USER', 'root');
define('DB_PASS', ''); // Blank for default XAMPP
define('DB_CHARSET', 'utf8mb4');
```
If you set a custom MySQL root password in XAMPP, update `DB_PASS` accordingly.

---

### Step 8: Verify Default User Accounts
The database import already seeds default secure accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@retail.com` | `admin123` | Full access (Products, Stock, Sales, Reports, Users, Settings) |
| **Staff Member** | `staff@retail.com` | `staff123` | Sales entry, stock lookup, daily reports, transaction history |

*Passwords in the database are securely hashed using PHP `password_hash($pass, PASSWORD_BCRYPT)` and verified using `password_verify()`.*

To create a new admin account:
1. Log in with `admin@retail.com` / `admin123`.
2. Go to **User Management** in the sidebar.
3. Fill in the name, email, password, and select **Administrator**.

---

### Step 9: Access the Application via Localhost
Open your browser and visit:
```
http://localhost/inventory_management/
```
You will be greeted by the secure login screen. Enter your email and password to log in.

---

### Step 10: Test Sales, Stock Calculations, and Report Printing
1. **View Dashboard:** Check total products, total stock, units sold today, and total daily revenue.
2. **Record a Sale:**
   - Go to **Record Daily Sales** (`sales.php`).
   - Select a product (e.g. *T-Shirt (Crew Neck Cotton)*).
   - Notice the SKU, available stock, and unit price fill in automatically.
   - Enter quantity (e.g., 2). Observe the live sale total calculation (`2 × Rs. 1,500 = Rs. 3,000`).
   - Click **Save Sale & Update Inventory**.
   - Notice that the available stock decreases instantly by 2 units, and a stock movement audit log is recorded!
3. **Restock Inventory:**
   - Go to **Stock Management** (`stock.php`).
   - Select a product, enter quantity (e.g., 10), and click **Confirm & Update Stock**.
   - Formula verified: `Remaining Stock = Previous Stock + Added Stock - Quantity Sold`.
4. **Generate & Print End-of-Day Report:**
   - Go to **Daily Sales Report** (`report.php`).
   - View the table displaying Opening Stock, Stock Added, Qty Sold, Remaining Stock, Unit Price, and Total Revenue.
   - Click **Print Daily Report** or open `print_report.php` to launch the browser's clean A4 print dialog (`window.print()`).

---

## 📁 Project Architecture & File Structure

```
├── config/
│   └── database.php           # PDO connection, charset, and application settings
├── includes/
│   ├── auth.php               # Middleware, session auth, CSRF protection, helpers
│   ├── header.php             # HTML head, Bootstrap 5, topbar navbar
│   ├── sidebar.php            # 10 sidebar navigation items with active states
│   └── footer.php             # Scripts, closing tags
├── assets/
│   ├── css/style.css          # Modern SaaS CSS with @media print A4 optimization
│   └── js/main.js             # Mobile drawer toggle & alert dismissals
├── database/
│   └── inventory_management.sql # Complete DDL schema and seed data
├── index.php                  # Application gateway & login redirector
├── login.php                  # Secure authentication with password_verify() & CSRF
├── logout.php                 # Safe session destruction
├── dashboard.php              # Real-time metrics, stock alerts, Chart.js trend
├── products.php               # Product catalog, category filters, search, archive
├── product_add.php            # Add new product with initial stock movement
├── product_edit.php           # Edit product details and pricing
├── stock.php                  # Stock restock, adjustment, and audit log history
├── sales.php                  # Record daily sales with row locking & auto calculations
├── report.php                 # End-of-day sales report with historical movement calculations
├── print_report.php           # Clean A4 printable report with signatures & window.print()
├── sales_history.php          # Date range filters and sales audit log
├── users.php                  # User & staff management (Admin only)
├── settings.php               # Business name, currency (Rs.), timezone (Asia/Colombo)
└── README.md                  # Complete documentation and setup manual
```

---

## 🔒 Security & Data Integrity Features

- **PDO Prepared Statements:** Every SQL query uses parameterized statements to prevent SQL Injection.
- **CSRF Protection:** Form tokens (`csrf_token()`) are generated on every session and verified on POST submissions.
- **XSS Prevention:** All output rendered to the browser is escaped via `e()` (`htmlspecialchars`).
- **Atomic Transactions & Row Locking:** Concurrent sales use `SELECT ... FOR UPDATE` and `BEGIN TRANSACTION` to prevent race conditions and negative inventory.
- **Strict Role-Based Access Control:** Administrative pages (`users.php`, `settings.php`) are guarded by `require_admin()`.
- **Audit Logging:** Every stock change (initial, restock, sale, return, adjustment) is permanently recorded in `stock_movements`.
