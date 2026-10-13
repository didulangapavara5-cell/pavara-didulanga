<?php
$page_title = 'Edit Product';
require_once __DIR__ . '/includes/header.php';

$currency = $app_settings['currency'] ?? 'Rs.';
$errors = [];
$product_id = (int)($_GET['id'] ?? 0);

$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? LIMIT 1");
$stmt->execute([$product_id]);
$product = $stmt->fetch();

if (!$product) {
    set_flash('error', "Product not found.");
    header("Location: products.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = "CSRF verification failed.";
    }

    $sku = strtoupper(trim($_POST['sku'] ?? ''));
    $name = trim($_POST['name'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $selling_price = (float)($_POST['selling_price'] ?? 0);
    $low_stock_threshold = (int)($_POST['low_stock_threshold'] ?? 10);

    if (empty($sku)) $errors[] = "SKU is required.";
    if (empty($name)) $errors[] = "Product name is required.";
    if (empty($category)) $errors[] = "Category is required.";
    if ($selling_price < 0) $errors[] = "Selling price cannot be negative.";
    if ($low_stock_threshold < 0) $errors[] = "Threshold cannot be negative.";

    if (empty($errors)) {
        $stmt = $pdo->prepare("SELECT id FROM products WHERE sku = ? AND id != ? LIMIT 1");
        $stmt->execute([$sku, $product_id]);
        if ($stmt->fetch()) {
            $errors[] = "SKU '{$sku}' is already assigned to another product.";
        }
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare("UPDATE products SET sku = ?, name = ?, category = ?, description = ?, selling_price = ?, low_stock_threshold = ? WHERE id = ?");
        $stmt->execute([
            $sku,
            $name,
            $category,
            $description,
            $selling_price,
            $low_stock_threshold,
            $product_id
        ]);
        set_flash('success', "Product updated successfully.");
        header("Location: products.php");
        exit();
    }
}
?>

<div class="row justify-content-center">
  <div class="col-12 col-lg-8">
    <div class="card">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0 fw-bold"><i class="bi bi-pencil-square text-primary me-2"></i>Edit Product: <?= e($product['name']) ?></h5>
          <span class="text-muted small">Update product details and pricing</span>
        </div>
        <span class="badge bg-secondary">Current Stock: <?= $product['current_stock'] ?></span>
      </div>
      <div class="card-body p-4">
        <?php if (!empty($errors)): ?>
          <div class="alert alert-danger">
            <ul class="mb-0 ps-3">
              <?php foreach ($errors as $err): ?>
                <li><?= e($err) ?></li>
              <?php endforeach; ?>
            </ul>
          </div>
        <?php endif; ?>

        <form method="POST">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Product Name <span class="text-danger">*</span></label>
              <input type="text" name="name" class="form-control" required value="<?= e($_POST['name'] ?? $product['name']) ?>">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">SKU <span class="text-danger">*</span></label>
              <input type="text" name="sku" class="form-control text-uppercase font-monospace" required value="<?= e($_POST['sku'] ?? $product['sku']) ?>">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Category <span class="text-danger">*</span></label>
              <input type="text" name="category" class="form-control" required value="<?= e($_POST['category'] ?? $product['category']) ?>">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Selling Price (<?= e($currency) ?>) <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text"><?= e($currency) ?></span>
                <input type="number" step="0.01" min="0" name="selling_price" class="form-control" required value="<?= e($_POST['selling_price'] ?? $product['selling_price']) ?>">
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Low-Stock Alert Threshold</label>
              <input type="number" min="0" name="low_stock_threshold" class="form-control" value="<?= e($_POST['low_stock_threshold'] ?? $product['low_stock_threshold']) ?>">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Current Stock (Read Only)</label>
              <input type="text" class="form-control bg-light" disabled value="<?= $product['current_stock'] ?> units (Use Stock Management to restock)">
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Description</label>
              <textarea name="description" class="form-control" rows="3"><?= e($_POST['description'] ?? $product['description']) ?></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <a href="products.php" class="btn btn-outline-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary px-4">
              <i class="bi bi-save me-1"></i>Update Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
