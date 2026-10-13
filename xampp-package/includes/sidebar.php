<?php
$current_page = basename($_SERVER['PHP_SELF']);
$is_admin = ($_SESSION['user_role'] ?? 'staff') === 'admin';
?>
<aside class="sidebar no-print">
  <a href="dashboard.php" class="sidebar-brand">
    <div class="bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
      <i class="bi bi-box-seam-fill fs-6"></i>
    </div>
    <span><?= e($app_settings['business_name'] ?? 'Apex Retail') ?></span>
  </a>

  <div class="sidebar-nav">
    <div class="sidebar-heading">Core</div>
    <a href="dashboard.php" class="nav-link <?= ($current_page === 'dashboard.php') ? 'active' : '' ?>">
      <i class="bi bi-speedometer2"></i>
      <span>Dashboard</span>
    </a>

    <div class="sidebar-heading">Inventory</div>
    <a href="products.php" class="nav-link <?= ($current_page === 'products.php') ? 'active' : '' ?>">
      <i class="bi bi-tags"></i>
      <span>Product Management</span>
    </a>
    <a href="product_add.php" class="nav-link <?= ($current_page === 'product_add.php') ? 'active' : '' ?>">
      <i class="bi bi-plus-circle"></i>
      <span>Add New Product</span>
    </a>
    <a href="stock.php" class="nav-link <?= ($current_page === 'stock.php') ? 'active' : '' ?>">
      <i class="bi bi-boxes"></i>
      <span>Stock Management</span>
    </a>

    <div class="sidebar-heading">Sales & Reports</div>
    <a href="sales.php" class="nav-link <?= ($current_page === 'sales.php') ? 'active' : '' ?>">
      <i class="bi bi-cart-check"></i>
      <span>Record Sales</span>
    </a>
    <a href="report.php" class="nav-link <?= ($current_page === 'report.php' || $current_page === 'print_report.php') ? 'active' : '' ?>">
      <i class="bi bi-file-earmark-bar-graph"></i>
      <span>Daily Sales Report</span>
    </a>
    <a href="sales_history.php" class="nav-link <?= ($current_page === 'sales_history.php') ? 'active' : '' ?>">
      <i class="bi bi-clock-history"></i>
      <span>Sales History</span>
    </a>

    <?php if ($is_admin): ?>
      <div class="sidebar-heading">Administration</div>
      <a href="users.php" class="nav-link <?= ($current_page === 'users.php') ? 'active' : '' ?>">
        <i class="bi bi-people"></i>
        <span>User Management</span>
      </a>
      <a href="settings.php" class="nav-link <?= ($current_page === 'settings.php') ? 'active' : '' ?>">
        <i class="bi bi-gear"></i>
        <span>Settings</span>
      </a>
    <?php endif; ?>

    <div class="sidebar-heading mt-3">Account</div>
    <a href="logout.php" class="nav-link text-danger">
      <i class="bi bi-box-arrow-right"></i>
      <span>Logout</span>
    </a>
  </div>
</aside>
