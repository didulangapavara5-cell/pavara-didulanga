<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/auth.php';
require_auth();

$current_page = basename($_SERVER['PHP_SELF']);
$page_title = $page_title ?? 'Dashboard';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($page_title) ?> - <?= e($app_settings['business_name'] ?? 'Smart Inventory') ?></title>
  
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="assets/css/style.css">
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
</head>
<body>
<div class="app-wrapper">
  <?php include __DIR__ . '/sidebar.php'; ?>
  
  <div class="main-content">
    <!-- Top Navbar -->
    <header class="top-navbar no-print">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-outline-secondary d-md-none" id="sidebarToggle">
          <i class="bi bi-list fs-5"></i>
        </button>
        <span class="fs-5 fw-semibold text-dark"><?= e($page_title) ?></span>
      </div>
      
      <div class="d-flex align-items-center gap-3">
        <div class="text-end d-none d-sm-block">
          <div class="fw-semibold text-dark"><?= e($_SESSION['user_name'] ?? 'User') ?></div>
          <div class="text-muted small text-capitalize"><span class="badge bg-primary-subtle text-primary border border-primary-subtle"><?= e($_SESSION['user_role'] ?? 'staff') ?></span></div>
        </div>
        <div class="dropdown">
          <button class="btn btn-light rounded-circle border p-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-fill text-primary"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li><h6 class="dropdown-header"><?= e($_SESSION['user_email'] ?? '') ?></h6></li>
            <?php if ($_SESSION['user_role'] === 'admin'): ?>
              <li><a class="dropdown-item" href="settings.php"><i class="bi bi-gear me-2"></i>Settings</a></li>
              <li><a class="dropdown-item" href="users.php"><i class="bi bi-people me-2"></i>Users</a></li>
            <?php endif; ?>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
          </ul>
        </div>
      </div>
    </header>
    
    <div class="content-body">
      <?php display_flash(); ?>
