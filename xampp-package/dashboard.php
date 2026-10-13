<?php
$page_title = 'Dashboard Overview';
require_once __DIR__ . '/includes/header.php';

$currency = $app_settings['currency'] ?? 'Rs.';
$today = date('Y-m-d');

// 1. Total registered products
$stmt = $pdo->query("SELECT COUNT(*) AS total_products, COALESCE(SUM(current_stock), 0) AS total_stock FROM products WHERE archived_at IS NULL");
$productStats = $stmt->fetch();
$totalProducts = (int)$productStats['total_products'];
$totalStock = (int)$productStats['total_stock'];

// 2. Total quantity sold today and Daily Revenue
$stmt = $pdo->prepare("SELECT COALESCE(SUM(quantity), 0) AS sold_today, COALESCE(SUM(total_amount), 0) AS revenue_today FROM sales WHERE DATE(sold_at) = ?");
$stmt->execute([$today]);
$salesToday = $stmt->fetch();
$qtySoldToday = (int)$salesToday['sold_today'];
$revenueToday = (float)$salesToday['revenue_today'];

// 3. Low stock and Out of stock counts & items
$stmt = $pdo->query("SELECT * FROM products WHERE archived_at IS NULL AND current_stock > 0 AND current_stock <= low_stock_threshold ORDER BY current_stock ASC LIMIT 5");
$lowStockProducts = $stmt->fetchAll();

$stmt = $pdo->query("SELECT * FROM products WHERE archived_at IS NULL AND current_stock = 0 ORDER BY name ASC LIMIT 5");
$outOfStockProducts = $stmt->fetchAll();

// 4. Recent sales transactions
$stmt = $pdo->query("SELECT s.*, p.name AS product_name, p.sku, u.name AS seller_name 
                     FROM sales s 
                     JOIN products p ON s.product_id = p.id 
                     JOIN users u ON s.user_id = u.id 
                     ORDER BY s.sold_at DESC LIMIT 6");
$recentSales = $stmt->fetchAll();

// 5. Chart Data: Last 7 Days Revenue
$chartDays = [];
$chartRevenue = [];
$chartQty = [];

for ($i = 6; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-$i days"));
    $label = date('M d', strtotime($d));
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_amount), 0) AS rev, COALESCE(SUM(quantity), 0) AS qty FROM sales WHERE DATE(sold_at) = ?");
    $stmt->execute([$d]);
    $res = $stmt->fetch();
    
    $chartDays[] = $label;
    $chartRevenue[] = (float)$res['rev'];
    $chartQty[] = (int)$res['qty'];
}
?>

<div class="row g-3 mb-4">
  <!-- Total Products -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card d-flex align-items-center justify-content-between">
      <div>
        <div class="text-muted small fw-semibold text-uppercase">Registered Products</div>
        <div class="fs-3 fw-bold text-dark mt-1"><?= number_format($totalProducts) ?></div>
        <div class="text-success small mt-1"><i class="bi bi-tag-fill me-1"></i>Active Catalog</div>
      </div>
      <div class="stat-icon bg-primary-subtle text-primary">
        <i class="bi bi-boxes"></i>
      </div>
    </div>
  </div>

  <!-- Available Stock -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card d-flex align-items-center justify-content-between">
      <div>
        <div class="text-muted small fw-semibold text-uppercase">Total Available Stock</div>
        <div class="fs-3 fw-bold text-dark mt-1"><?= number_format($totalStock) ?> <span class="fs-6 text-muted fw-normal">units</span></div>
        <div class="text-primary small mt-1"><i class="bi bi-layers me-1"></i>Warehouse & Store</div>
      </div>
      <div class="stat-icon bg-info-subtle text-info">
        <i class="bi bi-inboxes-fill"></i>
      </div>
    </div>
  </div>

  <!-- Quantity Sold Today -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card d-flex align-items-center justify-content-between">
      <div>
        <div class="text-muted small fw-semibold text-uppercase">Quantity Sold Today</div>
        <div class="fs-3 fw-bold text-dark mt-1"><?= number_format($qtySoldToday) ?> <span class="fs-6 text-muted fw-normal">items</span></div>
        <div class="text-secondary small mt-1"><i class="bi bi-calendar-check me-1"></i><?= date('D, d M') ?></div>
      </div>
      <div class="stat-icon bg-warning-subtle text-warning">
        <i class="bi bi-cart-check-fill"></i>
      </div>
    </div>
  </div>

  <!-- Total Daily Revenue -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card d-flex align-items-center justify-content-between bg-primary text-white border-0">
      <div>
        <div class="text-white-50 small fw-semibold text-uppercase">Total Daily Revenue</div>
        <div class="fs-3 fw-bold text-white mt-1"><?= e($currency) ?> <?= number_format($revenueToday, 2) ?></div>
        <div class="text-white-50 small mt-1"><i class="bi bi-graph-up me-1"></i>Today's Gross Sales</div>
      </div>
      <div class="stat-icon bg-white text-primary">
        <i class="bi bi-cash-stack"></i>
      </div>
    </div>
  </div>
</div>

<div class="row g-3 mb-4">
  <!-- Chart: 7-Day Revenue Trend -->
  <div class="col-12 col-lg-8">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0 fw-bold">Daily Sales & Revenue Trend</h6>
          <span class="text-muted small">Daily revenue summary over the last 7 days</span>
        </div>
        <a href="report.php" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-file-earmark-text me-1"></i>View Full Report
        </a>
      </div>
      <div class="card-body">
        <canvas id="salesTrendChart" height="110"></canvas>
      </div>
    </div>
  </div>

  <!-- Stock Alerts -->
  <div class="col-12 col-lg-4">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold">Stock Alerts</h6>
        <span class="badge bg-danger"><?= count($lowStockProducts) + count($outOfStockProducts) ?> Warnings</span>
      </div>
      <div class="card-body p-0">
        <ul class="list-group list-group-flush">
          <?php if (empty($lowStockProducts) && empty($outOfStockProducts)): ?>
            <li class="list-group-item text-center py-4 text-muted">
              <i class="bi bi-shield-check text-success fs-2 d-block mb-2"></i>
              All inventory levels are healthy!
            </li>
          <?php endif; ?>

          <?php foreach ($outOfStockProducts as $out): ?>
            <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
              <div>
                <span class="badge bg-danger me-1">Out of Stock</span>
                <span class="fw-semibold text-dark"><?= e($out['name']) ?></span>
                <div class="text-muted small">SKU: <?= e($out['sku']) ?></div>
              </div>
              <a href="stock.php?product_id=<?= $out['id'] ?>" class="btn btn-sm btn-outline-danger">Restock</a>
            </li>
          <?php endforeach; ?>

          <?php foreach ($lowStockProducts as $low): ?>
            <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
              <div>
                <span class="badge bg-warning text-dark me-1"><?= $low['current_stock'] ?> left</span>
                <span class="fw-semibold text-dark"><?= e($low['name']) ?></span>
                <div class="text-muted small">Threshold: <?= $low['low_stock_threshold'] ?></div>
              </div>
              <a href="stock.php?product_id=<?= $low['id'] ?>" class="btn btn-sm btn-outline-primary">Add Stock</a>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
</div>

<!-- Recent Transactions -->
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h6 class="mb-0 fw-bold">Recent Sales Transactions</h6>
    <a href="sales_history.php" class="btn btn-sm btn-outline-secondary">View All Sales</a>
  </div>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>Code</th>
          <th>Product</th>
          <th>SKU</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total Amount</th>
          <th>Staff</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($recentSales)): ?>
          <tr><td colspan="8" class="text-center py-4 text-muted">No sales recorded yet.</td></tr>
        <?php else: ?>
          <?php foreach ($recentSales as $sale): ?>
            <tr>
              <td><span class="badge bg-light text-dark border"><?= e($sale['sale_code']) ?></span></td>
              <td class="fw-semibold"><?= e($sale['product_name']) ?></td>
              <td><code><?= e($sale['sku']) ?></code></td>
              <td><span class="badge bg-primary-subtle text-primary"><?= (int)$sale['quantity'] ?></span></td>
              <td><?= e($currency) ?> <?= number_format($sale['unit_price_at_sale'], 2) ?></td>
              <td class="fw-bold text-success"><?= e($currency) ?> <?= number_format($sale['total_amount'], 2) ?></td>
              <td><?= e($sale['seller_name']) ?></td>
              <td class="text-muted small"><?= date('h:i A', strtotime($sale['sold_at'])) ?></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('salesTrendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: <?= json_encode($chartDays) ?>,
      datasets: [{
        label: 'Revenue (<?= e($currency) ?>)',
        data: <?= json_encode($chartRevenue) ?>,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(val) { return '<?= e($currency) ?> ' + val.toLocaleString(); }
          }
        }
      }
    }
  });
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
