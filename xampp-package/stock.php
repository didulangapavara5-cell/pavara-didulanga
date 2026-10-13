<?php
$page_title = 'Stock Management';
require_once __DIR__ . '/includes/header.php';

$errors = [];
$selected_product_id = (int)($_GET['product_id'] ?? 0);

// Handle Stock Addition / Adjustment
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_stock') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = "Security token mismatch. Please try again.";
    }

    $product_id = (int)($_POST['product_id'] ?? 0);
    $quantity = (int)($_POST['quantity'] ?? 0);
    $movement_type = $_POST['movement_type'] ?? 'restock';
    $notes = trim($_POST['notes'] ?? '');

    if ($product_id <= 0) $errors[] = "Please select a valid product.";
    if ($quantity <= 0) $errors[] = "Added stock quantity must be greater than zero.";
    if (!in_array($movement_type, ['restock', 'adjustment', 'return'])) {
        $movement_type = 'restock';
    }

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            // Lock row FOR UPDATE to prevent race conditions
            $stmt = $pdo->prepare("SELECT id, name, current_stock FROM products WHERE id = ? FOR UPDATE");
            $stmt->execute([$product_id]);
            $product = $stmt->fetch();

            if (!$product) {
                throw new Exception("Product not found in database.");
            }

            $stock_before = (int)$product['current_stock'];
            $stock_after = $stock_before + $quantity;

            // Update product stock
            $stmtUpdate = $pdo->prepare("UPDATE products SET current_stock = ? WHERE id = ?");
            $stmtUpdate->execute([$stock_after, $product_id]);

            // Insert stock movement record
            $ref = 'STK-' . date('Ymd') . '-' . substr(strval(time()), -4);
            $stmtMove = $pdo->prepare("INSERT INTO stock_movements (product_id, movement_type, quantity, stock_before, stock_after, user_id, reference_id, notes) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmtMove->execute([
                $product_id,
                $movement_type,
                $quantity,
                $stock_before,
                $stock_after,
                $_SESSION['user_id'],
                $ref,
                $notes ?: ("Added " . $quantity . " units via " . ucfirst($movement_type))
            ]);

            $pdo->commit();
            set_flash('success', "Stock updated successfully for {$product['name']}! New stock level: {$stock_after} units.");
            header("Location: stock.php?product_id=" . $product_id);
            exit();
        } catch (Exception $e) {
            $pdo->rollBack();
            $errors[] = "Transaction failed: " . $e->getMessage();
        }
    }
}

// Fetch all active products for the dropdown
$stmtProds = $pdo->query("SELECT id, sku, name, current_stock, low_stock_threshold FROM products WHERE archived_at IS NULL ORDER BY name ASC");
$allProducts = $stmtProds->fetchAll();

// Fetch stock movements history
$filterProd = (int)($_GET['filter_product'] ?? 0);
$queryMov = "SELECT m.*, p.name AS product_name, p.sku, u.name AS user_name 
             FROM stock_movements m 
             JOIN products p ON m.product_id = p.id 
             JOIN users u ON m.user_id = u.id 
             WHERE 1=1";
$movParams = [];

if ($filterProd > 0) {
    $queryMov .= " AND m.product_id = ?";
    $movParams[] = $filterProd;
}

$queryMov .= " ORDER BY m.created_at DESC LIMIT 50";
$stmtMov = $pdo->prepare($queryMov);
$stmtMov->execute($movParams);
$movements = $stmtMov->fetchAll();
?>

<div class="row g-4 mb-4">
  <!-- Stock Addition Form -->
  <div class="col-12 col-lg-5">
    <div class="card h-100 shadow-sm">
      <div class="card-header bg-white py-3">
        <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-box-arrow-in-down text-success me-2"></i>Add / Restock Inventory</h6>
        <span class="text-muted small">Update stock levels with transaction safety</span>
      </div>
      <div class="card-body p-3 p-md-4">
        <?php if (!empty($errors)): ?>
          <div class="alert alert-danger py-2 small">
            <?php foreach ($errors as $e): ?>
              <div><i class="bi bi-exclamation-circle me-1"></i><?= e($e) ?></div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>

        <form method="POST" action="stock.php">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
          <input type="hidden" name="action" value="add_stock">

          <div class="mb-3">
            <label class="form-label fw-semibold">Select Product <span class="text-danger">*</span></label>
            <select name="product_id" id="productSelect" class="form-select" required onchange="updateStockPreview()">
              <option value="">-- Choose a Product --</option>
              <?php foreach ($allProducts as $p): ?>
                <option value="<?= $p['id'] ?>" 
                        data-stock="<?= $p['current_stock'] ?>" 
                        data-threshold="<?= $p['low_stock_threshold'] ?>"
                        <?= ($selected_product_id == $p['id']) ? 'selected' : '' ?>>
                  <?= e($p['name']) ?> (<?= e($p['sku']) ?>) - Current: <?= $p['current_stock'] ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <!-- Live Inventory Calculation Preview -->
          <div class="p-3 bg-light rounded-3 mb-3 border">
            <div class="d-flex justify-content-between mb-1 small">
              <span class="text-muted">Previous Available Stock:</span>
              <span class="fw-bold" id="prevStockDisplay">0 units</span>
            </div>
            <div class="d-flex justify-content-between mb-1 small text-success">
              <span>+ Newly Added Stock:</span>
              <span class="fw-bold" id="addedStockDisplay">+0 units</span>
            </div>
            <hr class="my-2">
            <div class="d-flex justify-content-between fw-bold text-dark">
              <span>New Available Stock:</span>
              <span class="text-primary fs-6" id="newStockDisplay">0 units</span>
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label fw-semibold">Quantity to Add <span class="text-danger">*</span></label>
              <input type="number" min="1" name="quantity" id="addQtyInput" class="form-control" placeholder="e.g. 20" required value="10" oninput="updateStockPreview()">
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Movement Reason</label>
              <select name="movement_type" class="form-select">
                <option value="restock">Restock / Purchase</option>
                <option value="return">Customer Return</option>
                <option value="adjustment">Manual Adjustment</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Notes / Supplier Reference</label>
            <input type="text" name="notes" class="form-control" placeholder="e.g. Batch #PO-2026-99 or Supplier delivery">
          </div>

          <button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
            <i class="bi bi-check-circle me-1"></i>Confirm & Update Stock
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Stock Summary Cards -->
  <div class="col-12 col-lg-7">
    <div class="card h-100 shadow-sm">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold"><i class="bi bi-clock-history text-primary me-2"></i>Stock Movement Audit Log</h6>
        <div class="d-flex gap-2 align-items-center">
          <form method="GET" class="d-flex gap-1 align-items-center">
            <select name="filter_product" class="form-select form-select-sm" onchange="this.form.submit()">
              <option value="0">All Products</option>
              <?php foreach ($allProducts as $p): ?>
                <option value="<?= $p['id'] ?>" <?= ($filterProd == $p['id']) ? 'selected' : '' ?>><?= e($p['name']) ?></option>
              <?php endforeach; ?>
            </select>
          </form>
        </div>
      </div>
      <div class="table-responsive" style="max-height: 480px;">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light sticky-top">
            <tr>
              <th>Date / Time</th>
              <th>Product</th>
              <th>Type</th>
              <th class="text-center">Qty Change</th>
              <th class="text-center">Stock Path</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($movements)): ?>
              <tr><td colspan="6" class="text-center py-4 text-muted">No movement logs recorded yet.</td></tr>
            <?php else: ?>
              <?php foreach ($movements as $m): ?>
                <tr>
                  <td class="text-muted text-nowrap"><?= date('M d, H:i', strtotime($m['created_at'])) ?></td>
                  <td>
                    <div class="fw-semibold"><?= e($m['product_name']) ?></div>
                    <code class="small"><?= e($m['sku']) ?></code>
                  </td>
                  <td>
                    <?php if ($m['movement_type'] === 'sale'): ?>
                      <span class="badge bg-danger-subtle text-danger border border-danger-subtle">Sale</span>
                    <?php elseif ($m['movement_type'] === 'restock'): ?>
                      <span class="badge bg-success-subtle text-success border border-success-subtle">Restock</span>
                    <?php elseif ($m['movement_type'] === 'initial'): ?>
                      <span class="badge bg-info-subtle text-info border border-info-subtle">Initial</span>
                    <?php else: ?>
                      <span class="badge bg-secondary-subtle text-secondary"><?= ucfirst($m['movement_type']) ?></span>
                    <?php endif; ?>
                  </td>
                  <td class="text-center fw-bold <?= ($m['quantity'] < 0) ? 'text-danger' : 'text-success' ?>">
                    <?= ($m['quantity'] > 0) ? '+' : '' ?><?= $m['quantity'] ?>
                  </td>
                  <td class="text-center text-nowrap">
                    <span class="text-muted"><?= $m['stock_before'] ?></span>
                    <i class="bi bi-arrow-right mx-1 text-secondary"></i>
                    <span class="fw-bold text-dark"><?= $m['stock_after'] ?></span>
                  </td>
                  <td class="text-muted text-nowrap"><?= e($m['user_name']) ?></td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script>
function updateStockPreview() {
  const select = document.getElementById('productSelect');
  const qtyInput = document.getElementById('addQtyInput');
  const prevDisplay = document.getElementById('prevStockDisplay');
  const addedDisplay = document.getElementById('addedStockDisplay');
  const newDisplay = document.getElementById('newStockDisplay');

  const selectedOpt = select.options[select.selectedIndex];
  if (!selectedOpt || !selectedOpt.value) {
    prevDisplay.textContent = '0 units';
    addedDisplay.textContent = '+0 units';
    newDisplay.textContent = '0 units';
    return;
  }

  const current = parseInt(selectedOpt.getAttribute('data-stock') || '0', 10);
  const qty = parseInt(qtyInput.value || '0', 10);
  const safeQty = isNaN(qty) ? 0 : Math.max(0, qty);

  prevDisplay.textContent = current + ' units';
  addedDisplay.textContent = '+' + safeQty + ' units';
  newDisplay.textContent = (current + safeQty) + ' units';
}

document.addEventListener('DOMContentLoaded', updateStockPreview);
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
