<?php
$page_title = 'Record Daily Sales';
require_once __DIR__ . '/includes/header.php';

$currency = $app_settings['currency'] ?? 'Rs.';
$today = date('Y-m-d');
$errors = [];
$last_sale = null;

// Handle Record Sale Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = "Security session mismatch. Please try again.";
    }

    $product_id = (int)($_POST['product_id'] ?? 0);
    $quantity = (int)($_POST['quantity'] ?? 0);
    $payment_method = $_POST['payment_method'] ?? 'cash';
    $notes = trim($_POST['notes'] ?? '');

    if ($product_id <= 0) $errors[] = "Please select a product.";
    if ($quantity <= 0) $errors[] = "Quantity sold must be at least 1 unit.";

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            // Row-level lock FOR UPDATE on product row
            $stmt = $pdo->prepare("SELECT id, sku, name, selling_price, current_stock FROM products WHERE id = ? AND archived_at IS NULL FOR UPDATE");
            $stmt->execute([$product_id]);
            $product = $stmt->fetch();

            if (!$product) {
                throw new Exception("Product is not available or has been discontinued.");
            }

            $current_stock = (int)$product['current_stock'];
            if ($quantity > $current_stock) {
                throw new Exception("Cannot complete sale: Requested {$quantity} units, but only {$current_stock} units currently available in stock.");
            }

            $unit_price = (float)$product['selling_price'];
            $total_amount = $quantity * $unit_price;
            $new_stock = $current_stock - $quantity;
            $sale_code = 'SL-' . date('ymd') . '-' . strtoupper(substr(uniqid(), -4));

            // 1. Insert into sales table
            $stmtSale = $pdo->prepare("INSERT INTO sales (sale_code, product_id, user_id, quantity, unit_price_at_sale, total_amount, payment_method, sold_at) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmtSale->execute([
                $sale_code,
                $product['id'],
                $_SESSION['user_id'],
                $quantity,
                $unit_price,
                $total_amount,
                $payment_method
            ]);
            $sale_id = $pdo->lastInsertId();

            // 2. Immediately deduct sold quantity from product stock
            $stmtProdUpdate = $pdo->prepare("UPDATE products SET current_stock = ? WHERE id = ?");
            $stmtProdUpdate->execute([$new_stock, $product['id']]);

            // 3. Log stock movement
            $stmtMove = $pdo->prepare("INSERT INTO stock_movements (product_id, movement_type, quantity, stock_before, stock_after, user_id, reference_id, notes, created_at) 
                                       VALUES (?, 'sale', ?, ?, ?, ?, ?, ?, NOW())");
            $stmtMove->execute([
                $product['id'],
                -$quantity,
                $current_stock,
                $new_stock,
                $_SESSION['user_id'],
                $sale_code,
                $notes ?: ("Daily sale recorded ({$quantity} units)")
            ]);

            $pdo->commit();

            $last_sale = [
                'id' => $sale_id,
                'sale_code' => $sale_code,
                'product_name' => $product['name'],
                'sku' => $product['sku'],
                'quantity' => $quantity,
                'unit_price' => $unit_price,
                'total_amount' => $total_amount,
                'payment_method' => $payment_method,
                'remaining_stock' => $new_stock,
            ];

            set_flash('success', "Sale {$sale_code} recorded successfully! Deducted {$quantity} units. Remaining stock: {$new_stock} units.");
        } catch (Exception $e) {
            $pdo->rollBack();
            $errors[] = $e->getMessage();
        }
    }
}

// Fetch available products with stock > 0 first, but include all active products
$stmtProds = $pdo->query("SELECT id, sku, name, category, selling_price, current_stock, low_stock_threshold 
                          FROM products 
                          WHERE archived_at IS NULL 
                          ORDER BY (current_stock > 0) DESC, name ASC");
$products = $stmtProds->fetchAll();

// Today's total revenue for top badge
$stmtRev = $pdo->prepare("SELECT COALESCE(SUM(total_amount), 0) AS total_rev, COALESCE(SUM(quantity), 0) AS total_qty FROM sales WHERE DATE(sold_at) = ?");
$stmtRev->execute([$today]);
$todaySummary = $stmtRev->fetch();
?>

<!-- Header & Today Stats -->
<div class="row align-items-center mb-4">
  <div class="col-md-6">
    <h5 class="fw-bold mb-1"><i class="bi bi-cart-plus-fill text-primary me-2"></i>Record Daily Sales</h5>
    <p class="text-muted small mb-0">Record instant checkout with real-time stock deduction & row locking</p>
  </div>
  <div class="col-md-6 text-md-end mt-2 mt-md-0">
    <div class="d-inline-flex align-items-center gap-3 bg-white px-3 py-2 rounded-3 border">
      <div>
        <span class="text-muted small d-block">Today's Revenue</span>
        <span class="fw-bold text-success fs-6"><?= e($currency) ?> <?= number_format($todaySummary['total_rev'], 2) ?></span>
      </div>
      <div class="vr"></div>
      <div>
        <span class="text-muted small d-block">Items Sold</span>
        <span class="fw-bold text-dark fs-6"><?= (int)$todaySummary['total_qty'] ?> units</span>
      </div>
    </div>
  </div>
</div>

<?php if (!empty($errors)): ?>
  <div class="alert alert-danger py-2 mb-4">
    <div class="fw-semibold mb-1"><i class="bi bi-x-circle me-1"></i>Sale could not be saved:</div>
    <ul class="mb-0 ps-3">
      <?php foreach ($errors as $err): ?>
        <li><?= e($err) ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
<?php endif; ?>

<?php if ($last_sale): ?>
  <div class="alert alert-success d-flex justify-content-between align-items-center p-3 mb-4 border-2">
    <div>
      <div class="fw-bold fs-6"><i class="bi bi-check-circle-fill me-2"></i>Sale Confirmed: <?= e($last_sale['sale_code']) ?></div>
      <div class="small mt-1 text-secondary">
        <?= e($last_sale['product_name']) ?> (<?= e($last_sale['sku']) ?>) &bull; <?= $last_sale['quantity'] ?> units @ <?= e($currency) ?> <?= number_format($last_sale['unit_price'], 2) ?> = 
        <strong class="text-dark"><?= e($currency) ?> <?= number_format($last_sale['total_amount'], 2) ?></strong>
        &bull; Remaining Stock: <span class="badge bg-primary"><?= $last_sale['remaining_stock'] ?> units</span>
      </div>
    </div>
    <button class="btn btn-sm btn-outline-success" onclick="window.print()"><i class="bi bi-printer me-1"></i>Print Receipt</button>
  </div>
<?php endif; ?>

<div class="row g-4">
  <!-- Sales Entry Form -->
  <div class="col-12 col-lg-7">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <h6 class="mb-0 fw-bold"><i class="bi bi-pencil-fill text-primary me-2"></i>Sales Entry Details</h6>
      </div>
      <div class="card-body p-4">
        <form method="POST" action="sales.php" id="salesForm">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

          <!-- Date field -->
          <div class="mb-3">
            <label class="form-label fw-semibold small text-muted text-uppercase">Sale Transaction Date</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-calendar3"></i></span>
              <input type="date" class="form-control bg-light" value="<?= $today ?>" readonly>
            </div>
            <div class="form-text">System Timezone: <?= e($app_settings['timezone'] ?? 'Asia/Colombo') ?></div>
          </div>

          <!-- Product Selection -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Select Product <span class="text-danger">*</span></label>
            <select name="product_id" id="saleProductSelect" class="form-select form-select-lg" required onchange="handleProductSelect()">
              <option value="">-- Choose or Search Product --</option>
              <?php foreach ($products as $p): ?>
                <option value="<?= $p['id'] ?>"
                        data-sku="<?= e($p['sku']) ?>"
                        data-name="<?= e($p['name']) ?>"
                        data-price="<?= $p['selling_price'] ?>"
                        data-stock="<?= $p['current_stock'] ?>"
                        data-category="<?= e($p['category']) ?>"
                        <?= ($p['current_stock'] <= 0) ? 'class="text-danger"' : '' ?>>
                  <?= e($p['name']) ?> (<?= e($p['sku']) ?>) — Price: <?= e($currency) ?> <?= number_format($p['selling_price'], 2) ?> | Stock: <?= $p['current_stock'] ?><?= ($p['current_stock'] <= 0) ? ' [OUT OF STOCK]' : '' ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <!-- Product Info Cards -->
          <div class="row g-2 mb-3">
            <div class="col-4">
              <div class="p-2 border rounded bg-light text-center">
                <span class="text-muted small d-block">Product SKU</span>
                <span class="fw-bold font-monospace" id="displaySku">-</span>
              </div>
            </div>
            <div class="col-4">
              <div class="p-2 border rounded bg-light text-center">
                <span class="text-muted small d-block">Available Stock</span>
                <span class="fw-bold fs-6" id="displayStock">-</span>
              </div>
            </div>
            <div class="col-4">
              <div class="p-2 border rounded bg-light text-center">
                <span class="text-muted small d-block">Unit Selling Price</span>
                <span class="fw-bold text-primary" id="displayPrice"><?= e($currency) ?> 0.00</span>
              </div>
            </div>
          </div>

          <!-- Quantity Sold Input -->
          <div class="row g-3 mb-4">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Quantity Sold <span class="text-danger">*</span></label>
              <div class="input-group">
                <button type="button" class="btn btn-outline-secondary" onclick="adjustQty(-1)"><i class="bi bi-dash"></i></button>
                <input type="number" min="1" name="quantity" id="saleQtyInput" class="form-control text-center fw-bold fs-5" value="1" required oninput="calculateTotal()">
                <button type="button" class="btn btn-outline-secondary" onclick="adjustQty(1)"><i class="bi bi-plus"></i></button>
              </div>
              <div id="stockWarning" class="text-danger small mt-1 d-none">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>Quantity exceeds available stock!
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Payment Method</label>
              <select name="payment_method" class="form-select">
                <option value="cash">Cash (Counter)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="bank_transfer">Bank Transfer / QR Pay</option>
              </select>
            </div>
          </div>

          <!-- Automatic Calculated Sale Total -->
          <div class="p-3 rounded-3 mb-4 bg-primary-subtle border border-primary-subtle">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted small fw-semibold text-uppercase d-block">Calculated Sale Total</span>
                <div class="small text-muted" id="calcFormula">0 units &times; <?= e($currency) ?> 0.00</div>
              </div>
              <div class="text-end">
                <div class="fs-2 fw-bold text-primary" id="displayTotal"><?= e($currency) ?> 0.00</div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-4">
            <label class="form-label fw-semibold small text-muted">Notes / Customer Reference (Optional)</label>
            <input type="text" name="notes" class="form-control" placeholder="e.g. Counter 1, Customer Name or Receipt #">
          </div>

          <button type="submit" id="submitSaleBtn" class="btn btn-primary w-100 py-3 fw-bold fs-6">
            <i class="bi bi-check2-circle me-2"></i>Save Sale & Update Inventory
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Today's Live Sales Feed -->
  <div class="col-12 col-lg-5">
    <div class="card shadow-sm h-100">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold"><i class="bi bi-receipt text-primary me-2"></i>Today's Sales Records</h6>
        <span class="badge bg-light text-dark border"><?= date('M d, Y') ?></span>
      </div>
      <div class="card-body p-0">
        <?php
        $stmtTodayList = $pdo->prepare("SELECT s.*, p.name AS product_name, p.sku 
                                        FROM sales s 
                                        JOIN products p ON s.product_id = p.id 
                                        WHERE DATE(s.sold_at) = ? 
                                        ORDER BY s.sold_at DESC LIMIT 10");
        $stmtTodayList->execute([$today]);
        $todaySalesList = $stmtTodayList->fetchAll();
        ?>
        <div class="list-group list-group-flush">
          <?php if (empty($todaySalesList)): ?>
            <div class="p-4 text-center text-muted">
              <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
              No sales recorded for today yet.
            </div>
          <?php else: ?>
            <?php foreach ($todaySalesList as $ts): ?>
              <div class="list-group-item p-3">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="badge bg-light text-dark border me-1"><?= e($ts['sale_code']) ?></span>
                    <strong class="text-dark"><?= e($ts['product_name']) ?></strong>
                    <div class="text-muted small mt-1">
                      Qty: <span class="fw-bold text-dark"><?= $ts['quantity'] ?></span> &times; <?= e($currency) ?> <?= number_format($ts['unit_price_at_sale'], 2) ?>
                      <span class="badge bg-secondary-subtle text-secondary ms-1 text-uppercase"><?= e($ts['payment_method']) ?></span>
                    </div>
                  </div>
                  <div class="text-end">
                    <span class="fw-bold text-success fs-6"><?= e($currency) ?> <?= number_format($ts['total_amount'], 2) ?></span>
                    <div class="text-muted small"><?= date('h:i A', strtotime($ts['sold_at'])) ?></div>
                  </div>
                </div>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>
      <div class="card-footer bg-white text-center py-2">
        <a href="report.php" class="small text-decoration-none fw-semibold">View End-of-Day Report &rarr;</a>
      </div>
    </div>
  </div>
</div>

<script>
const CURRENCY = "<?= e($currency) ?>";

function handleProductSelect() {
  const select = document.getElementById('saleProductSelect');
  const opt = select.options[select.selectedIndex];
  const skuElem = document.getElementById('displaySku');
  const stockElem = document.getElementById('displayStock');
  const priceElem = document.getElementById('displayPrice');

  if (!opt || !opt.value) {
    skuElem.textContent = '-';
    stockElem.textContent = '-';
    priceElem.textContent = CURRENCY + ' 0.00';
    calculateTotal();
    return;
  }

  const sku = opt.getAttribute('data-sku') || '-';
  const stock = parseInt(opt.getAttribute('data-stock') || '0', 10);
  const price = parseFloat(opt.getAttribute('data-price') || '0');

  skuElem.textContent = sku;
  stockElem.textContent = stock + ' units';
  priceElem.textContent = CURRENCY + ' ' + price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

  if (stock <= 0) {
    stockElem.className = 'fw-bold fs-6 text-danger';
  } else {
    stockElem.className = 'fw-bold fs-6 text-dark';
  }

  calculateTotal();
}

function adjustQty(delta) {
  const input = document.getElementById('saleQtyInput');
  let val = parseInt(input.value || '1', 10) + delta;
  if (val < 1) val = 1;
  input.value = val;
  calculateTotal();
}

function calculateTotal() {
  const select = document.getElementById('saleProductSelect');
  const opt = select.options[select.selectedIndex];
  const qtyInput = document.getElementById('saleQtyInput');
  const warning = document.getElementById('stockWarning');
  const submitBtn = document.getElementById('submitSaleBtn');
  const formulaElem = document.getElementById('calcFormula');
  const totalElem = document.getElementById('displayTotal');

  const qty = parseInt(qtyInput.value || '0', 10);

  if (!opt || !opt.value) {
    totalElem.textContent = CURRENCY + ' 0.00';
    formulaElem.textContent = '0 units × ' + CURRENCY + ' 0.00';
    warning.classList.add('d-none');
    submitBtn.disabled = false;
    return;
  }

  const stock = parseInt(opt.getAttribute('data-stock') || '0', 10);
  const price = parseFloat(opt.getAttribute('data-price') || '0');
  const safeQty = Math.max(0, qty);
  const total = safeQty * price;

  formulaElem.textContent = safeQty + ' units × ' + CURRENCY + ' ' + price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  totalElem.textContent = CURRENCY + ' ' + total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

  if (safeQty > stock) {
    warning.classList.remove('d-none');
    submitBtn.disabled = true;
  } else if (stock <= 0) {
    warning.textContent = 'Product is completely out of stock!';
    warning.classList.remove('d-none');
    submitBtn.disabled = true;
  } else {
    warning.classList.add('d-none');
    submitBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', handleProductSelect);
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
