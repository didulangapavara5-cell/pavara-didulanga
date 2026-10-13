-- ============================================================================
-- SMART INVENTORY & DAILY SALES MANAGEMENT SYSTEM
-- Database SQL Installation & Seed Script
-- Target Database: MySQL 8.0+ / MariaDB 10.4+ (XAMPP Default)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `inventory_management` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `inventory_management`;

-- Disable foreign key checks during creation and seeding
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Table structure for `settings`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `business_name` VARCHAR(150) NOT NULL DEFAULT 'Apex Retail & Mart',
  `currency` VARCHAR(20) NOT NULL DEFAULT 'Rs.',
  `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Colombo',
  `business_address` TEXT DEFAULT 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  `contact_number` VARCHAR(50) DEFAULT '+94 11 234 5678',
  `email` VARCHAR(100) DEFAULT 'info@apexretail.lk',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table structure for `users`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table structure for `products`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `selling_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `current_stock` INT NOT NULL DEFAULT 0,
  `low_stock_threshold` INT NOT NULL DEFAULT 10,
  `image` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `archived_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_product_sku` (`sku`),
  INDEX `idx_product_category` (`category`),
  INDEX `idx_product_stock` (`current_stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table structure for `sales`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sale_code` VARCHAR(50) NOT NULL UNIQUE,
  `product_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price_at_sale` DECIMAL(12, 2) NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `payment_method` ENUM('cash', 'card', 'bank_transfer') NOT NULL DEFAULT 'cash',
  `sold_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sales_product` (`product_id`),
  INDEX `idx_sales_user` (`user_id`),
  INDEX `idx_sales_date` (`sold_at`),
  CONSTRAINT `fk_sales_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table structure for `stock_movements`
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `movement_type` ENUM('initial', 'restock', 'sale', 'adjustment', 'return') NOT NULL,
  `quantity` INT NOT NULL, -- Negative for sales, positive for restock/returns
  `stock_before` INT NOT NULL,
  `stock_after` INT NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `reference_id` VARCHAR(100) NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_movement_product` (`product_id`),
  INDEX `idx_movement_date` (`created_at`),
  INDEX `idx_movement_type` (`movement_type`),
  CONSTRAINT `fk_movement_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_movement_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SEED DATA
-- Default Passwords:
-- admin@retail.com -> admin123
-- staff@retail.com -> staff123
-- Hashes generated with password_hash('...', PASSWORD_BCRYPT)
-- ============================================================================

INSERT INTO `settings` (`id`, `business_name`, `currency`, `timezone`, `business_address`, `contact_number`, `email`)
VALUES (1, 'Apex Retail & Mart', 'Rs.', 'Asia/Colombo', 'No. 45, Galle Road, Colombo 03, Sri Lanka', '+94 11 234 5678', 'info@apexretail.lk')
ON DUPLICATE KEY UPDATE `id` = 1;

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`) VALUES
(1, 'Ruwan Perera', 'admin@retail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(2, 'Kasun Jayasuriya', 'staff@retail.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'staff', 1);

-- Default Products Matching Specification
INSERT INTO `products` (`id`, `sku`, `name`, `category`, `description`, `selling_price`, `current_stock`, `low_stock_threshold`, `image`, `created_at`, `archived_at`) VALUES
(1, 'TSH-001', 'T-Shirt (Crew Neck Cotton)', 'Men Apparel', '100% combed cotton soft premium regular fit t-shirt', 1500.00, 88, 15, 'tshirt.jpg', NOW(), NULL),
(2, 'JNS-002', 'Slim Fit Denim Jeans', 'Men Apparel', 'Stretchable heavy denim fabric with reinforced stitching', 3000.00, 45, 10, 'jeans.jpg', NOW(), NULL),
(3, 'DRS-003', 'Floral Casual Summer Dress', 'Women Apparel', 'Lightweight breathable rayon floral printed midi dress', 4500.00, 27, 8, 'dress.jpg', NOW(), NULL),
(4, 'SHT-004', 'Cotton Casual Button Shirt', 'Men Apparel', 'Crisp breathable oxford cotton long sleeve button shirt', 2800.00, 42, 10, 'shirt.jpg', NOW(), NULL),
(5, 'BLT-005', 'Genuine Leather Dress Belt', 'Accessories', 'Full-grain brown leather belt with solid brass buckle', 1200.00, 6, 10, 'belt.jpg', NOW(), NULL),
(6, 'SNK-006', 'Classic Urban Canvas Sneakers', 'Footwear', 'All-day comfort low-top vulcanized rubber sneakers', 6500.00, 0, 5, 'sneakers.jpg', NOW(), NULL),
(7, 'PLO-007', 'Pique Polo T-Shirt', 'Men Apparel', 'Sporty knit polo with ribbed collar and pearl buttons', 2200.00, 35, 8, 'polo.jpg', NOW(), NULL),
(8, 'JKT-008', 'Vintage Denim Trucker Jacket', 'Outerwear', 'Classic western cut vintage wash denim jacket', 5800.00, 15, 5, 'jacket.jpg', NOW(), NULL);

-- Initial Stock Movements
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `stock_before`, `stock_after`, `user_id`, `reference_id`, `notes`, `created_at`) VALUES
(1, 1, 'initial', 100, 0, 100, 1, 'INIT-001', 'Initial inventory stock load', NOW()),
(2, 2, 'initial', 50, 0, 50, 1, 'INIT-002', 'Initial inventory stock load', NOW()),
(3, 3, 'initial', 30, 0, 30, 1, 'INIT-003', 'Initial inventory stock load', NOW()),
(4, 4, 'initial', 42, 0, 42, 1, 'INIT-004', 'Initial inventory stock load', NOW()),
(5, 5, 'initial', 6, 0, 6, 1, 'INIT-005', 'Initial inventory stock load', NOW()),
(6, 7, 'initial', 35, 0, 35, 1, 'INIT-007', 'Initial inventory stock load', NOW()),
(7, 8, 'initial', 15, 0, 15, 1, 'INIT-008', 'Initial inventory stock load', NOW());

-- Initial Sales Matching Example:
-- T-Shirt: 12 x Rs. 1,500 = Rs. 18,000
-- Jeans: 5 x Rs. 3,000 = Rs. 15,000
-- Dress: 3 x Rs. 4,500 = Rs. 13,500
-- Total Daily Revenue = Rs. 46,500
INSERT INTO `sales` (`id`, `sale_code`, `product_id`, `user_id`, `quantity`, `unit_price_at_sale`, `total_amount`, `payment_method`, `sold_at`) VALUES
(1, 'SL-26001', 1, 2, 12, 1500.00, 18000.00, 'cash', NOW()),
(2, 'SL-26002', 2, 2, 5, 3000.00, 15000.00, 'card', NOW()),
(3, 'SL-26003', 3, 1, 3, 4500.00, 13500.00, 'cash', NOW());

-- Sales Stock Movements
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `stock_before`, `stock_after`, `user_id`, `reference_id`, `notes`, `created_at`) VALUES
(8, 1, 'sale', -12, 100, 88, 2, 'SL-26001', 'Sale of 12 units', NOW()),
(9, 2, 'sale', -5, 50, 45, 2, 'SL-26002', 'Sale of 5 units', NOW()),
(10, 3, 'sale', -3, 30, 27, 1, 'SL-26003', 'Sale of 3 units', NOW());
