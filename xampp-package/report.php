<?php
$page_title = 'Daily Sales & Stock Report';
require_once __DIR__ . '/includes/header.php';

$currency = $app_settings['currency'] ?? 'Rs.';
$selected_date = trim($_GET['date'] ?? date('Y-m-d'));

// Validate date format YYYY-MM-DD
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $selected_date)) {
    $selected_date = date('Y-m-d');
}

$startOfDay = $selected_date . ' 00:00:00';
$endOfDay = $selected_date . ' 23:59:59';

// 1. Fetch sales for the selected date grouped by product
$stmtSales = $pdo->prepare("SELECT product_id, SUM(quantity) AS qty_sold, SUM(total_amount) AS revenue, AVG(unit_price_at_sale) as avg_price 
                            FROM sales 
                            WHERE sold_at BETWEEN ? AND ? 
                            GROUP BY product_id");
$stmtSales->execute([$startOfDay, $endOfDay]);
$salesByProduct = [];
while ($row = $stmtSales->fetch()) {
    $salesByProduct[$row['product_id']] = [
        'qty' => (int)$row['qty_sold'],
        'revenue' => (float)$row['revenue'],
        'unit_price' => (float)$row['avg_price'],
    ];
}

// 2. Fetch stock added (restock / initial / return) on selected date
$stmtAdded = $pdo->prepare("SELECT product_id, SUM(quantity) AS stock_added 
                            FROM stock_movements 
                            WHERE created_at BETWEEN ? AND ? AND quantity > 0 AND movement_type IN ('restock', 'return', 'initial') 
                            GROUP BY product_id");
$stmtAdded->execute([$startOfDay, $endOfDay]);
$addedByProduct = [];
while ($row = $stmtAdded->fetch()) {
    $addedByProduct[$row['product_id']] = (int)$row['stock_added'];
}

// 3. Fetch movements after the end of selected date to calculate historical closing stock
$stmtAfter = $pdo->prepare("SELECT product_id, SUM(quantity) as net_after 
                            FROM stock_movements 
                            WHERE created_at > ? 
                            GROUP BY product_id");
$stmtAfter->execute([$endOfDay]);
$movementsAfterDay = [];
while ($row = $stmtAfter->fetch()) {
    $movementsAfterDay[$row['product_id']] = (int)$row['net_after'];
}

// 4. Fetch all products registered on or before this date
$stmtAllProducts = $pdo->prepare("SELECT * FROM products WHERE DATE(created_at) <= ? ORDER BY name ASC");
$stmtAllProducts->execute([$selected_date]);
$allProducts = $stmtAllProducts->fetchAll();

// Assemble report rows
$reportRows = [];
$grandTotalRevenue = 0.0;
$grandTotalSold = 0;
$grandTotalAdded = 0;
$grandTotalOpening = 0;
$grandTotalClosing = 0;

foreach ($allProducts as $p) {
    $pid = $p['id'];
    $soldInfo = $salesByProduct[$pid] ?? ['qty' => 0, 'revenue' => 0.0, 'unit_price' => (float)$p['selling_price']];
    $qtySold = $soldInfo['qty'];
    $revenue = $soldInfo['revenue'];
    $unitPrice = $soldInfo['unit_price'] ?: (float)$p['selling_price'];
    $stockAdded = $addedByProduct[$pid] ?? 0;

    // Historical closing stock at end of selected day:
    // current_stock - (net change after that day)
    $netChangeAfter = $movementsAfterDay[$pid] ?? 0;
    $remainingStock = $p['current_stock'] - $netChangeAfter;

    // Opening Stock = Remaining Stock - Stock Added + Qty Sold
    $openingStock = max(0, $remainingStock - $stockAdded + $qtySold);

    $grandTotalRevenue += $revenue;
    $grandTotalSold += $qtySold;
    $grandTotalAdded += $stockAdded;
    $grandTotalOpening += $openingStock;
    $grandTotalClosing += $remainingStock;

    $reportRows[] = [
        'name' => $p['name'],
        'sku' => $p['sku'],
        'opening_stock' => $openingStock,
        'stock_added' => $stockAdded,
        'qty_sold' => $qtySold,
        'remaining_stock' => $remainingStock,
        'unit_price' => $unitPrice,
        'total_revenue' => $revenue,
    ];
}

// Sort so products with sales appear first, then alphabetical
usort($reportRows, function ($a, $b) {
    if ($b['qty_sold'] !== $a['qty_sold']) {
        return $b['qty_sold'] - $a['qty_sold'];
    }
    return strcmp($a['name'], $b['name']);
});
?>

<!-- Action bar & Date selector (hidden on print) -->
<div class="card mb-4 no-print shadow-sm">
  <div class="card-body p-3">
    <div class="row g-3 align-items-center justify-content-between">
      <div class="col-12 col-md-6">
        <form method="GET" action="report.php" class="d-flex align-items-center gap-2">
          <label class="form-label fw-bold mb-0 text-nowrap"><i class="bi bi-calendar-event me-1"></i>Report Date:</label>
          <input type="date" name="date" class="form-control" value="<?= e($selected_date) ?>" max="<?= date('Y-m-d') ?>">
          <button type="submit" class="btn btn-primary px-3 text-nowrap">Generate Report</button>
        </form>
      </div>
      <div class="col-12 col-md-6 text-md-end d-flex gap-2 justify-content-md-end">
        <a href="print_report.php?date=<?= e($selected_date) ?>" target="_blank" class="btn btn-outline-secondary">
          <i class="bi bi-box-arrow-up-right me-1"></i>Dedicated Print View
        </a>
        <button type="button" class="btn btn-dark fw-semibold" onclick="window.print()">
          <i class="bi bi-printer-fill me-1"></i>Print Daily Report
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Report Container (Both screen and print optimized) -->
<div class="card shadow-sm border report-container p-4 p-md-5 bg-white">
  <!-- Report Header -->
  <div class="border-bottom pb-4 mb-4">
    <div class="row align-items-center">
      <div class="col-8">
        <h3 class="fw-bold text-dark mb-1"><?= e($app_settings['business_name'] ?? 'Apex Retail & Mart') ?></h3>
        <p class="text-muted small mb-1"><?= e($app_settings['business_address'] ?? 'No. 45, Galle Road, Colombo 03, Sri Lanka') ?> | Phone: <?= e($app_settings['contact_number'] ?? '+94 11 234 5678') ?></p>
        <h4 class="fw-bolder text-primary text-uppercase mt-2 mb-0" style="letter-spacing: 0.05em;">DAILY SALES & STOCK REPORT</h4>
      </div>
      <div class="col-4 text-end">
        <div class="p-2 rounded bg-light border d-inline-block text-start">
          <div class="small"><strong>Report Date:</strong> <?= date('F d, Y', strtotime($selected_date)) ?></div>
          <div class="small text-muted"><strong>Generated At:</strong> <?= date('h:i A') ?> (<?= e($app_settings['timezone'] ?? 'Asia/Colombo') ?>)</div>
          <div class="small text-muted"><strong>Generated By:</strong> <?= e($_SESSION['user_name'] ?? 'Admin') ?> (<?= e($_SESSION['user_role'] ?? 'admin') ?>)</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Key Metrics Summary Banner -->
  <div class="row g-3 mb-4 text-center">
    <div class="col-3">
      <div class="p-3 border rounded bg-light">
        <span class="text-muted small fw-semibold text-uppercase d-block">Total Revenue</span>
        <span class="fs-4 fw-bold text-success"><?= e($currency) ?> <?= number_format($grandTotalRevenue, 2) ?></span>
      </div>
    </div>
    <div class="col-3">
      <div class="p-3 border rounded bg-light">
        <span class="text-muted small fw-semibold text-uppercase d-block">Quantity Sold</span>
        <span class="fs-4 fw-bold text-dark"><?= number_format($grandTotalSold) ?> units</span>
      </div>
    </div>
    <div class="col-3">
      <div class="p-3 border rounded bg-light">
        <span class="text-muted small fw-semibold text-uppercase d-block">Stock Added</span>
        <span class="fs-4 fw-bold text-primary"><?= number_format($grandTotalAdded) ?> units</span>
      </div>
    </div>
    <div class="col-3">
      <div class="p-3 border rounded bg-light">
        <span class="text-muted small fw-semibold text-uppercase d-block">Closing Stock</span>
        <span class="fs-4 fw-bold text-dark"><?= number_format($grandTotalClosing) ?> units</span>
      </div>
    </div>
  </div>

  <!-- Detailed Product-Wise Report Table -->
  <div class="table-responsive">
    <table class="table table-bordered report-table align-middle">
      <thead>
        <tr class="table-light">
          <th>Product Name</th>
          <th class="text-end">Opening Stock</th>
          <th class="text-end">Stock Added</th>
          <th class="text-end">Qty Sold</th>
          <th class="text-end">Remaining Stock</th>
          <th class="text-end">Unit Price (<?= e($currency) ?>)</th>
          <th class="text-end">Total Revenue (<?= e($currency) ?>)</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($reportRows)): ?>
          <tr><td colspan="7" class="text-center py-4 text-muted">No product or stock records found for this date.</td></tr>
        <?php else: ?>
          <?php foreach ($reportRows as $row): ?>
            <tr>
              <td>
                <span class="fw-semibold text-dark"><?= e($row['name']) ?></span>
                <span class="text-muted small ms-1 font-monospace">(<?= e($row['sku']) ?>)</span>
              </td>
              <td class="text-end"><?= number_format($row['opening_stock']) ?></td>
              <td class="text-end <?= ($row['stock_added'] > 0) ? 'text-success fw-bold' : 'text-muted' ?>">
                <?= number_format($row['stock_added']) ?>
              </td>
              <td class="text-end fw-bold <?= ($row['qty_sold'] > 0) ? 'text-primary' : 'text-muted' ?>">
                <?= number_format($row['qty_sold']) ?>
              </td>
              <td class="text-end fw-bold text-dark"><?= number_format($row['remaining_stock']) ?></td>
              <td class="text-end"><?= number_format($row['unit_price'], 2) ?></td>
              <td class="text-end fw-bold <?= ($row['total_revenue'] > 0) ? 'text-success' : 'text-muted' ?>">
                <?= number_format($row['total_revenue'], 2) ?>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
      <tfoot class="table-light border-top-2">
        <tr class="fw-bold fs-6">
          <td>SUMMARY TOTALS</td>
          <td class="text-end"><?= number_format($grandTotalOpening) ?></td>
          <td class="text-end"><?= number_format($grandTotalAdded) ?></td>
          <td class="text-end text-primary"><?= number_format($grandTotalSold) ?></td>
          <td class="text-end text-dark"><?= number_format($grandTotalClosing) ?></td>
          <td class="text-end text-muted">-</td>
          <td class="text-end text-success fs-5"><?= e($currency) ?> <?= number_format($grandTotalRevenue, 2) ?></td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Grand Total Revenue Banner matching prompt requirement -->
  <div class="p-3 my-4 rounded border bg-light d-flex justify-content-between align-items-center">
    <span class="fw-bold text-dark fs-5">TOTAL DAILY REVENUE:</span>
    <span class="fw-bolder text-success fs-3"><?= e($currency) ?> <?= number_format($grandTotalRevenue, 2) ?></span>
  </div>

  <!-- Signature Area for Daily Business Recordkeeping -->
  <div class="row pt-5 mt-4 print-signature-area text-center">
    <div class="col-4">
      <div class="border-top pt-2">
        <p class="mb-0 fw-semibold">Prepared By</p>
        <p class="text-muted small"><?= e($_SESSION['user_name'] ?? 'Store Staff') ?></p>
      </div>
    </div>
    <div class="col-4">
      <div class="border-top pt-2">
        <p class="mb-0 fw-semibold">Verified By Stock Keeper</p>
        <p class="text-muted small">Signature & Date</p>
      </div>
    </div>
    <div class="col-4">
      <div class="border-top pt-2">
        <p class="mb-0 fw-semibold">Authorized Manager</p>
        <p class="text-muted small">Signature & Stamp</p>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
