import React, { useState } from 'react';
import {
  Server,
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  FolderTree,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Database,
} from 'lucide-react';

export const XamppDocsView: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'sql' | 'files'>('guide');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleDownloadSql = () => {
    const sqlText = `-- SMART INVENTORY & DAILY SALES MANAGEMENT SYSTEM
CREATE DATABASE IF NOT EXISTS \`inventory_management\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`inventory_management\`;

DROP TABLE IF EXISTS \`settings\`;
CREATE TABLE \`settings\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`business_name\` VARCHAR(150) NOT NULL DEFAULT 'Apex Retail & Mart',
  \`currency\` VARCHAR(20) NOT NULL DEFAULT 'Rs.',
  \`timezone\` VARCHAR(50) NOT NULL DEFAULT 'Asia/Colombo',
  \`business_address\` TEXT DEFAULT 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  \`contact_number\` VARCHAR(50) DEFAULT '+94 11 234 5678',
  \`email\` VARCHAR(100) DEFAULT 'info@apexretail.lk',
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS \`products\`;
CREATE TABLE \`products\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`sku\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(200) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`selling_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`current_stock\` INT NOT NULL DEFAULT 0,
  \`low_stock_threshold\` INT NOT NULL DEFAULT 10,
  \`image\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`archived_at\` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS \`sales\`;
CREATE TABLE \`sales\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`sale_code\` VARCHAR(50) NOT NULL UNIQUE,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`quantity\` INT NOT NULL,
  \`unit_price_at_sale\` DECIMAL(12, 2) NOT NULL,
  \`total_amount\` DECIMAL(12, 2) NOT NULL,
  \`payment_method\` ENUM('cash', 'card', 'bank_transfer') NOT NULL DEFAULT 'cash',
  \`sold_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_sales_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON UPDATE CASCADE,
  CONSTRAINT \`fk_sales_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS \`stock_movements\`;
CREATE TABLE \`stock_movements\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`movement_type\` ENUM('initial', 'restock', 'sale', 'adjustment', 'return') NOT NULL,
  \`quantity\` INT NOT NULL,
  \`stock_before\` INT NOT NULL,
  \`stock_after\` INT NOT NULL,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`reference_id\` VARCHAR(100) NULL,
  \`notes\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_movement_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON UPDATE CASCADE,
  CONSTRAINT \`fk_movement_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`settings\` (\`id\`, \`business_name\`, \`currency\`, \`timezone\`, \`business_address\`, \`contact_number\`, \`email\`)
VALUES (1, 'Apex Retail & Mart', 'Rs.', 'Asia/Colombo', 'No. 45, Galle Road, Colombo 03, Sri Lanka', '+94 11 234 5678', 'info@apexretail.lk');

INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`, \`is_active\`) VALUES
(1, 'Ruwan Perera', 'admin@retail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(2, 'Kasun Jayasuriya', 'staff@retail.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'staff', 1);

INSERT INTO \`products\` (\`id\`, \`sku\`, \`name\`, \`category\`, \`description\`, \`selling_price\`, \`current_stock\`, \`low_stock_threshold\`) VALUES
(1, 'TSH-001', 'T-Shirt (Crew Neck Cotton)', 'Men Apparel', '100% combed cotton', 1500.00, 88, 15),
(2, 'JNS-002', 'Slim Fit Denim Jeans', 'Men Apparel', 'Stretchable heavy denim', 3000.00, 45, 10),
(3, 'DRS-003', 'Floral Casual Summer Dress', 'Women Apparel', 'Lightweight rayon dress', 4500.00, 27, 8);
`;

    const blob = new Blob([sqlText], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_management.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              Localhost &amp; XAMPP Package
            </span>
            <span className="text-xs text-slate-400">PHP 8+ &bull; MySQL &bull; PDO &bull; Bootstrap 5</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">PHP/MySQL Source Code &amp; Setup Manual</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Complete, self-contained PHP 8+ source code, PDO database connections, and MySQL installation schema ready for deployment into standard XAMPP or production hosting.
          </p>
        </div>

        <button
          onClick={handleDownloadSql}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download MySQL SQL File</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'guide'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          10-Step Beginner XAMPP Guide
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'sql'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          MySQL Schema &amp; Seed Script
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'files'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Project File Structure
        </button>
      </div>

      {/* Tab 1: 10-Step Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                <span>Install XAMPP</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download XAMPP for your OS from <strong className="text-slate-900">apachefriends.org</strong> with PHP 8.1+. Ensure Apache, MySQL, and phpMyAdmin are selected.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
                <span>Copy to htdocs</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Copy all files from <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">xampp-package/</code> into <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">C:\xampp\htdocs\inventory_management\</code>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
                <span>Start Apache &amp; MySQL</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open XAMPP Control Panel, click <strong>Start</strong> on both Apache and MySQL. Both modules should turn green.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">4</span>
                <span>Open phpMyAdmin</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In your browser, visit <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">http://localhost/phpmyadmin/</code>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">5</span>
                <span>Create Database</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click <strong>Databases</strong> &rarr; enter name: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">inventory_management</code> &rarr; Collation: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">utf8mb4_unicode_ci</code> &rarr; Click <strong>Create</strong>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">6</span>
                <span>Import SQL File</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">inventory_management</code> database &rarr; click <strong>Import</strong> &rarr; choose <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">database/inventory_management.sql</code> &rarr; click <strong>Import</strong>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">7</span>
                <span>Configure Database Credentials</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">config/database.php</code>. Default XAMPP settings (host: localhost, user: root, password: '') work out of the box.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">8</span>
                <span>Default Credentials</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Admin: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">admin@retail.com</code> / <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">admin123</code><br/>
                Staff: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">staff@retail.com</code> / <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">staff123</code>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">9</span>
                <span>Access the Web App</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visit <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">http://localhost/inventory_management/</code> in your browser to sign in.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">10</span>
                <span>Test Sales &amp; Reports</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record daily sales, test automatic stock deductions, add stock in Stock Management, and generate printable A4 reports!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SQL Script */}
      {activeTab === 'sql' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">inventory_management.sql (Complete MySQL Script)</h3>
              <p className="text-xs text-slate-400">DDL tables, constraints, indexes, and seeded retail data</p>
            </div>
            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sql</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
{`-- Database: inventory_management
CREATE DATABASE IF NOT EXISTS \`inventory_management\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`inventory_management\`;

-- Tables:
-- 1. settings (business_name, currency, timezone, business_address, contact_number, email)
-- 2. users (id, name, email, password, role, is_active, created_at)
-- 3. products (id, sku, name, category, description, selling_price, current_stock, low_stock_threshold, image, created_at, archived_at)
-- 4. sales (id, sale_code, product_id, user_id, quantity, unit_price_at_sale, total_amount, payment_method, sold_at)
-- 5. stock_movements (id, product_id, movement_type, quantity, stock_before, stock_after, user_id, reference_id, notes, created_at)

-- Seed accounts:
-- admin@retail.com / admin123
-- staff@retail.com / staff123`}
          </pre>
        </div>
      )}

      {/* Tab 3: File Structure */}
      {activeTab === 'files' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Included XAMPP Package Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-900 block font-sans">Core Application:</span>
              <div>&bull; index.php (Entry redirector)</div>
              <div>&bull; login.php (Secure authentication &amp; CSRF)</div>
              <div>&bull; logout.php (Session destruction)</div>
              <div>&bull; dashboard.php (KPI cards &amp; Chart.js)</div>
              <div>&bull; products.php (Catalog &amp; category filter)</div>
              <div>&bull; product_add.php (New product &amp; initial stock)</div>
              <div>&bull; product_edit.php (Edit details &amp; pricing)</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-900 block font-sans">Sales, Stock &amp; Reports:</span>
              <div>&bull; sales.php (Record sales &amp; atomic stock deduction)</div>
              <div>&bull; stock.php (Restock &amp; movement audit log)</div>
              <div>&bull; report.php (End-of-day sales &amp; stock matrix)</div>
              <div>&bull; print_report.php (Dedicated A4 printable report)</div>
              <div>&bull; sales_history.php (Date range &amp; product filters)</div>
              <div>&bull; users.php (Staff and role management)</div>
              <div>&bull; settings.php (Shop address, currency &amp; timezone)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
