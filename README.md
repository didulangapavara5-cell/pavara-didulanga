# Smart Inventory & Daily Sales Management System

A modern, responsive, secure, and user-friendly web-based Inventory and Daily Sales Management System for retail businesses. Built with **PHP 8+**, **MySQL**, **PDO**, and **Bootstrap 5 / Tailwind**.

---

## 🚀 Quick Start in Live Preview

This applet runs an interactive version directly in your browser with pre-loaded retail demo data (Colombo Apparel & Mart, Sri Lankan Rupees `Rs.`, Asia/Colombo timezone).

- **Admin Account:** `admin@retail.com` / `admin123`
- **Staff Account:** `staff@retail.com` / `staff123`

You can test all workflows in real-time:
1. **Dashboard Overview:** KPI metrics, 7-day revenue chart, stock health warnings.
2. **Product Management:** Search, category filter, adding products with SKU and initial stock, archiving discontinued items.
3. **Stock Management:** Restock inventory, formula `Remaining Stock = Previous Stock + Added Stock - Sold Qty`, and view permanent movement audit trails.
4. **Record Daily Sales:** Product selection, live `Quantity Sold × Unit Price = Total` calculation, atomic stock validation (no negative stock), instant deduction.
5. **Daily Sales & Stock Report:** Full daily matrix: Opening Stock, Stock Added, Qty Sold, Remaining Stock, Unit Price, Total Revenue.
6. **Print Daily Report:** Clean A4 black-and-white layout with signatures and `window.print()`.
7. **XAMPP & PHP Source Code Explorer:** Built-in tab to view, copy, and download the full PHP 8+ / MySQL PDO project for local deployment in XAMPP!

---

## 💻 Beginner-Friendly XAMPP Setup (10 Steps)

The full ready-to-deploy PHP project files are located in `/xampp-package/` and the database script is at `/database/inventory_management.sql`.

1. **Install XAMPP:** Download from [https://www.apachefriends.org/](https://www.apachefriends.org/) (PHP 8.1+).
2. **Copy to htdocs:** Copy files from `xampp-package/` into `C:\xampp\htdocs\inventory_management\`.
3. **Start Servers:** In XAMPP Control Panel, click **Start** on **Apache** and **MySQL**.
4. **Open phpMyAdmin:** Visit `http://localhost/phpmyadmin/`.
5. **Create Database:** Create a new database named `inventory_management` (`utf8mb4_unicode_ci`).
6. **Import SQL:** Go to the Import tab and choose `database/inventory_management.sql`.
7. **Configure PDO:** Check `config/database.php` (defaults: `root` and empty password).
8. **Accounts:** Log in with `admin@retail.com` / `admin123` or `staff@retail.com` / `staff123`.
9. **Access Localhost:** Open `http://localhost/inventory_management/` in your browser.
10. **Test Features:** Record sales, restock, check formula calculations, and test printable reports!
