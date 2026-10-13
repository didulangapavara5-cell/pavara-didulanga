<?php
$page_title = 'Sales History';
require_once __DIR__ . '/includes/header.php';

$currency = $app_settings['currency'] ?? 'Rs.';

// Filter inputs
$date_from = trim($_GET['date_from'] ?? date('Y-m-d', strtotime('-30 days')));
$date_to = trim($_GET['date_to'] ?? date('Y-m-d'));
$filter_product = (int)($_GET['product_id'] ?? 0);
$search = trim($_GET['search'] ?? '');

$query = "SELECT s.*, p.name AS product_name, p.sku, u.name AS seller_name 
          FROM sales s 
          JOIN products p ON s.product_id = p.id 
          JOIN users u ON s.user_id = u.id 
          WHERE DATE(s.sold_at) BETWEEN ? AND ?";
$params = [$date_from, $date_to];

if ($filter_product > 0) {
    $query .= " AND s.product_id = ?";
    $params[] = $filter_product;
}

if (!empty($search)) {
    $query .= " AND (s.sale_code LIKE ? OR p.name LIKE ? OR p.sku LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

$query .= " ORDER BY s.sold_at DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$salesHistory = $stmt->fetchAll();

// Calculate totals for filtered range
$totalFilteredRevenue = 0;
$totalFilteredQty = 0;
foreach ($salesHistory as $sh) {
    $totalFilteredRevenue += (float)$sh['total_amount'];
    $totalFilteredQty += (int)$sh['quantity'];
}

// Fetch all products for filter dropdown
$stmtProds = $pdo->query("SELECT id, name, sku FROM products ORDER BY name ASC");
$allProds = $stmtProds->fetchAll();
?>

<!-- Filter Card -->
<div class="card mb-4 shadow-sm">
  <div class="card-body p-3">
    <form method="GET" action="sales_history.php" class="row g-2 align-items-end">
      <div class="col-12 col-md-3">
        <label class="form-label small fw-semibold text-muted">From Date</label>
        <input type="date" name="date_from" class="form-control" value="<?= e($date_from) ?>">
      </div>

      <div class="col-12 col-md-3">
        <label class="form-label small fw-semibold text-muted">To Date</label>
        <input type="date" name="date_to" class="form-control" value="<?= e($date_to) ?>">
      </div>

      <div class="col-12 col-md-3">
        <label class="form-label small fw-semibold text-muted">Filter by Product</label>
        <select name="product_id" class="form-select">
          <option value="0">All Products</option>
          <?php foreach ($allProds as $ap): ?>
            <option value="<?= $ap['id'] ?>" <?= ($filter_product == $ap['id']) ? 'selected' : '' ?>>
              <?= e($ap['name']) ?> (<?= e($ap['sku']) ?>)
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="col-12 col-md-3 d-flex gap-2">
        <button type="submit" class="btn btn-primary w-100">
          <i class="bi bi-funnel me-1"></i>Filter Sales
        </button>
        <a href="sales_history.php" class="btn btn-outline-secondary" title="Reset Filters">
          <i class="bi bi-arrow-counterclockwise"></i>
        </a>
      </div>
    </form>
  </div>
</div>

<!-- Summary row -->
<div class="row g-3 mb-4">
  <div class="col-12 col-md-6">
    <div class="p-3 bg-white border rounded d-flex justify-content-between align-items-center">
      <div>
        <span class="text-muted small text-uppercase fw-semibold">Filtered Range Revenue</span>
        <div class="fs-4 fw-bold text-success mt-1"><?= e($currency) ?> <?= number_format($totalFilteredRevenue, 2) ?></div>
      </div>
      <i class="bi bi-wallet2 fs-2 text-success opacity-75"></i>
    </div>
  </div>
  <div class="col-12 col-md-6">
    <div class="p-3 bg-white border rounded d-flex justify-content-between align-items-center">
      <div>
        <span class="text-muted small text-uppercase fw-semibold">Total Units Sold</span>
        <div class="fs-4 fw-bold text-dark mt-1"><?= number_format($totalFilteredQty) ?> units</div>
      </div>
      <i class="bi bi-bag-check fs-2 text-primary opacity-75"></i>
    </div>
  </div>
</div>

<!-- Sales Table -->
<div class="card shadow-sm">
  <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
    <h6 class="mb-0 fw-bold"><i class="bi bi-clock-history text-primary me-2"></i>Sales Transaction Ledger</h6>
    <span class="badge bg-light text-dark border"><?= count($salesHistory) ?> Transactions Found</span>
  </div>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>Sale ID</th>
          <th>Date & Time</th>
          <th>Product</th>
          <th>SKU</th>
          <th class="text-center">Qty</th>
          <th class="text-end">Unit Price</th>
          <th class="text-end">Total Amount</th>
          <th>Method</th>
          <th>Handled By</th>
          <th class="text-end">Action</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($salesHistory)): ?>
          <tr><td colspan="10" class="text-center py-5 text-muted">No sales found for the selected date range.</td></tr>
        <?php else: ?>
          <?php foreach ($salesHistory as $s): ?>
            <tr>
              <td><code><?= e($s['sale_code']) ?></code></td>
              <td class="text-muted small text-nowrap"><?= date('Y-m-d H:i', strtotime($s['sold_at'])) ?></td>
              <td class="fw-semibold text-dark"><?= e($s['product_name']) ?></td>
              <td><code><?= e($s['sku']) ?></code></td>
              <td class="text-center fw-bold text-primary"><?= (int)$s['quantity'] ?></td>
              <td class="text-end"><?= e($currency) ?> <?= number_format($s['unit_price_at_sale'], 2) ?></td>
              <td class="text-end fw-bold text-success"><?= e($currency) ?> <?= number_format($s['total_amount'], 2) ?></td>
              <td><span class="badge bg-light text-dark border text-uppercase small"><?= e($s['payment_method']) ?></span></td>
              <td class="small"><?= e($s['seller_name']) ?></td>
              <td class="text-end">
                <a href="report.php?date=<?= date('Y-m-d', strtotime($s['sold_at'])) ?>" class="btn btn-sm btn-outline-primary" title="View Daily Report for this date">
                  <i class="bi bi-file-earmark-text"></i>
                </a>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
