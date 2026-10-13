<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_auth();

$currency = $app_settings['currency'] ?? 'Rs.';
$selected_date = trim($_GET['date'] ?? date('Y-m-d'));

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $selected_date)) {
    $selected_date = date('Y-m-d');
}

$startOfDay = $selected_date . ' 00:00:00';
$endOfDay = $selected_date . ' 23:59:59';

// Sales on selected date
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

// Stock added
$stmtAdded = $pdo->prepare("SELECT product_id, SUM(quantity) AS stock_added 
                            FROM stock_movements 
                            WHERE created_at BETWEEN ? AND ? AND quantity > 0 AND movement_type IN ('restock', 'return', 'initial') 
                            GROUP BY product_id");
$stmtAdded->execute([$startOfDay, $endOfDay]);
$addedByProduct = [];
while ($row = $stmtAdded->fetch()) {
    $addedByProduct[$row['product_id']] = (int)$row['stock_added'];
}

// Movements after selected date
$stmtAfter = $pdo->prepare("SELECT product_id, SUM(quantity) as net_after 
                            FROM stock_movements 
                            WHERE created_at > ? 
                            GROUP BY product_id");
$stmtAfter->execute([$endOfDay]);
$movementsAfterDay = [];
while ($row = $stmtAfter->fetch()) {
    $movementsAfterDay[$row['product_id']] = (int)$row['net_after'];
}

$stmtAllProducts = $pdo->prepare("SELECT * FROM products WHERE DATE(created_at) <= ? ORDER BY name ASC");
$stmtAllProducts->execute([$selected_date]);
$allProducts = $stmtAllProducts->fetchAll();

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

    $netChangeAfter = $movementsAfterDay[$pid] ?? 0;
    $remainingStock = $p['current_stock'] - $netChangeAfter;
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

usort($reportRows, function ($a, $b) {
    if ($b['qty_sold'] !== $a['qty_sold']) {
        return $b['qty_sold'] - $a['qty_sold'];
    }
    return strcmp($a['name'], $b['name']);
});
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DAILY SALES & STOCK REPORT - <?= e($selected_date) ?></title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 20mm 15mm;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 20px;
      font-size: 10.5pt;
      line-height: 1.4;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .report-title {
      font-size: 15pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 6px 0 0 0;
      text-transform: uppercase;
    }
    .meta-box {
      font-size: 9pt;
      line-height: 1.5;
      text-align: right;
    }
    .summary-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      border: 1px solid #000;
      padding: 10px 14px;
      background-color: #f9f9f9;
    }
    .summary-item {
      text-align: center;
    }
    .summary-label {
      font-size: 8pt;
      text-transform: uppercase;
      font-weight: bold;
      color: #444;
    }
    .summary-val {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 2px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      page-break-inside: auto;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #333;
      padding: 6px 8px;
      font-size: 9.5pt;
    }
    table.data-table th {
      background-color: #f0f0f0;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8.5pt;
    }
    table.data-table tr {
      page-break-inside: avoid;
    }
    .text-right {
      text-align: right;
    }
    .total-banner {
      margin-top: 16px;
      border: 2px solid #000;
      padding: 10px 14px;
      font-size: 12pt;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .signatures {
      margin-top: 55px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-line {
      width: 28%;
      border-top: 1px solid #000;
      padding-top: 6px;
      text-align: center;
      font-size: 9pt;
    }
    .no-print {
      margin-bottom: 20px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 10px 16px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>

<div class="no-print">
  <div>
    <strong>Print Preview (A4 Portrait)</strong> &bull; Generated for <?= e($selected_date) ?>
  </div>
  <div>
    <button onclick="window.print()" style="padding: 6px 16px; background: #2563eb; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
      Print Now / Save as PDF
    </button>
    <button onclick="window.close()" style="padding: 6px 12px; margin-left: 6px; cursor: pointer;">
      Close
    </button>
  </div>
</div>

<table class="header-table">
  <tr>
    <td style="vertical-align: top;">
      <h2 style="margin: 0; font-size: 16pt;"><?= e($app_settings['business_name'] ?? 'Apex Retail & Mart') ?></h2>
      <div style="font-size: 9pt; color: #444; margin-top: 2px;">
        <?= e($app_settings['business_address'] ?? 'No. 45, Galle Road, Colombo 03, Sri Lanka') ?> | Tel: <?= e($app_settings['contact_number'] ?? '+94 11 234 5678') ?>
      </div>
      <div class="report-title">DAILY SALES &amp; STOCK REPORT</div>
    </td>
    <td style="vertical-align: top; width: 260px;" class="meta-box">
      <div><strong>Report Date:</strong> <?= date('F d, Y', strtotime($selected_date)) ?></div>
      <div><strong>Generated:</strong> <?= date('Y-m-d h:i A') ?> (<?= e($app_settings['timezone'] ?? 'Asia/Colombo') ?>)</div>
      <div><strong>Generated By:</strong> <?= e($_SESSION['user_name'] ?? 'Admin') ?> (<?= e($_SESSION['user_role'] ?? 'admin') ?>)</div>
    </td>
  </tr>
</table>

<div class="summary-grid">
  <div class="summary-item">
    <div class="summary-label">Total Opening Stock</div>
    <div class="summary-val"><?= number_format($grandTotalOpening) ?></div>
  </div>
  <div class="summary-item">
    <div class="summary-label">Stock Added Today</div>
    <div class="summary-val"><?= number_format($grandTotalAdded) ?></div>
  </div>
  <div class="summary-item">
    <div class="summary-label">Total Qty Sold</div>
    <div class="summary-val"><?= number_format($grandTotalSold) ?></div>
  </div>
  <div class="summary-item">
    <div class="summary-label">Closing Remaining Stock</div>
    <div class="summary-val"><?= number_format($grandTotalClosing) ?></div>
  </div>
  <div class="summary-item">
    <div class="summary-label">Total Daily Revenue</div>
    <div class="summary-val"><?= e($currency) ?> <?= number_format($grandTotalRevenue, 2) ?></div>
  </div>
</div>

<table class="data-table">
  <thead>
    <tr>
      <th style="text-align: left;">Product Name</th>
      <th class="text-right">Opening Stock</th>
      <th class="text-right">Stock Added</th>
      <th class="text-right">Qty Sold</th>
      <th class="text-right">Remaining Stock</th>
      <th class="text-right">Unit Price (<?= e($currency) ?>)</th>
      <th class="text-right">Total Revenue (<?= e($currency) ?>)</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($reportRows as $row): ?>
      <tr>
        <td>
          <strong><?= e($row['name']) ?></strong>
          <span style="font-size: 8pt; color: #555;">[<?= e($row['sku']) ?>]</span>
        </td>
        <td class="text-right"><?= number_format($row['opening_stock']) ?></td>
        <td class="text-right"><?= number_format($row['stock_added']) ?></td>
        <td class="text-right"><strong><?= number_format($row['qty_sold']) ?></strong></td>
        <td class="text-right"><?= number_format($row['remaining_stock']) ?></td>
        <td class="text-right"><?= number_format($row['unit_price'], 2) ?></td>
        <td class="text-right"><strong><?= number_format($row['total_revenue'], 2) ?></strong></td>
      </tr>
    <?php endforeach; ?>
  </tbody>
  <tfoot>
    <tr style="background: #f0f0f0; font-weight: bold;">
      <td>TOTALS:</td>
      <td class="text-right"><?= number_format($grandTotalOpening) ?></td>
      <td class="text-right"><?= number_format($grandTotalAdded) ?></td>
      <td class="text-right"><?= number_format($grandTotalSold) ?></td>
      <td class="text-right"><?= number_format($grandTotalClosing) ?></td>
      <td class="text-right">-</td>
      <td class="text-right"><?= e($currency) ?> <?= number_format($grandTotalRevenue, 2) ?></td>
    </tr>
  </tfoot>
</table>

<div class="total-banner">
  <span>TOTAL DAILY REVENUE:</span>
  <span><?= e($currency) ?> <?= number_format($grandTotalRevenue, 2) ?></span>
</div>

<div class="signatures">
  <div class="sig-line">
    <strong>Prepared By:</strong><br><br>
    <?= e($_SESSION['user_name'] ?? 'Staff') ?>
  </div>
  <div class="sig-line">
    <strong>Verified By:</strong><br><br>
    Stock Controller / Auditor
  </div>
  <div class="sig-line">
    <strong>Authorized Manager:</strong><br><br>
    Signature &amp; Official Stamp
  </div>
</div>

</body>
</html>
