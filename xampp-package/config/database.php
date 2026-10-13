<?php
/**
 * Database Connection Configuration
 * Uses PHP Data Objects (PDO) with prepared statements and secure error handling
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'inventory_management');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // In production, log error instead of displaying raw message
    die("Database Connection Error: Could not connect to the database. " . $e->getMessage());
}

// Fetch global settings
try {
    $stmt = $pdo->query("SELECT * FROM settings WHERE id = 1 LIMIT 1");
    $app_settings = $stmt->fetch();
    if (!$app_settings) {
        $app_settings = [
            'business_name' => 'Apex Retail & Mart',
            'currency' => 'Rs.',
            'timezone' => 'Asia/Colombo',
            'business_address' => 'No. 45, Galle Road, Colombo 03, Sri Lanka',
            'contact_number' => '+94 11 234 5678',
            'email' => 'info@apexretail.lk'
        ];
    }
    date_default_timezone_set($app_settings['timezone'] ?? 'Asia/Colombo');
} catch (Exception $e) {
    date_default_timezone_set('Asia/Colombo');
    $app_settings = [
        'business_name' => 'Apex Retail & Mart',
        'currency' => 'Rs.',
        'timezone' => 'Asia/Colombo',
        'business_address' => 'Colombo, Sri Lanka',
        'contact_number' => '+94 11 234 5678',
        'email' => 'info@apexretail.lk'
    ];
}
?>
