<?php
/**
 * Authentication Middleware & Security Helper Functions
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Escapes HTML output to prevent XSS attacks
 */
function e($string) {
    return htmlspecialchars((string)$string, ENT_QUOTES, 'UTF-8');
}

/**
 * Generate CSRF token
 */
function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token
 */
function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Check if user is logged in
 */
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Require authenticated user
 */
function require_auth() {
    if (!is_logged_in()) {
        header("Location: login.php");
        exit();
    }
}

/**
 * Require admin role
 */
function require_admin() {
    require_auth();
    if ($_SESSION['user_role'] !== 'admin') {
        $_SESSION['flash_error'] = "Access denied: Administrator privileges required.";
        header("Location: dashboard.php");
        exit();
    }
}

/**
 * Set flash alert message
 */
function set_flash($type, $message) {
    $_SESSION['flash_' . $type] = $message;
}

/**
 * Display flash alerts if present
 */
function display_flash() {
    if (!empty($_SESSION['flash_success'])) {
        echo '<div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>' . e($_SESSION['flash_success']) . '
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>';
        unset($_SESSION['flash_success']);
    }
    if (!empty($_SESSION['flash_error'])) {
        echo '<div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>' . e($_SESSION['flash_error']) . '
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>';
        unset($_SESSION['flash_error']);
    }
}
?>
