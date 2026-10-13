<?php
$page_title = 'Add New Product';
require_once __DIR__ . '/includes/header.php';

$currency = $app_settings['currency'] ?? 'Rs.';
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = "CSRF verification failed. Please try again.";
    }

    $sku = strtoupper(trim($_POST['sku'] ?? ''));
    $name = trim($_POST['name'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $selling_price = (float)($_POST['selling_price'] ?? 0);
    $initial_stock = (int)($_POST['initial_stock'] ?? 0);
    $low_stock_threshold = (int)($_POST['low_stock_threshold'] ?? 10);
    $image_name = '';

    if (empty($sku)) $errors[] = "Product SKU is required.";
    if (empty($name)) $errors[] = "Product name is required.";
    if (empty($category)) $errors[] = "Product category is required.";
    if ($selling_price < 0) $errors[] = "Selling price cannot be negative.";
    if ($initial_stock < 0) $errors[] = "Initial stock cannot be negative.";
    if ($low_stock_threshold < 0) $errors[] = "Low stock alert threshold cannot be negative.";

    // Check SKU uniqueness
    if (empty($errors)) {
        $stmt = $pdo->prepare("SELECT id FROM products WHERE sku = ? LIMIT 1");
        $stmt->execute([$sku]);
        if ($stmt->fetch()) {
            $errors[] = "SKU '{$sku}' already exists in inventory. Please use a unique SKU.";
        }
    }

    // Handle optional image upload
    if (empty($errors) && !empty($_FILES['image']['name'])) {
        $upload_dir = __DIR__ . '/uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        $file_info = pathinfo($_FILES['image']['name']);
        $ext = strtolower($file_info['extension'] ?? '');
        $allowed_exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        
        if (!in_array($ext, $allowed_exts)) {
            $errors[] = "Only JPG, PNG, WEBP, and GIF images are allowed.";
        } else {
            $image_name = 'prod_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            if (!move_uploaded_file($_FILES['image']['tmp_name'], $upload_dir . $image_name)) {
                $errors[] = "Failed to upload image file.";
            }
        }
    }

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO products (sku, name, category, description, selling_price, current_stock, low_stock_threshold, image) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $sku,
                $name,
                $category,
                $description,
                $selling_price,
                $initial_stock,
                $low_stock_threshold,
                $image_name
            ]);
            $product_id = $pdo->lastInsertId();

            // Record initial stock movement
            if ($initial_stock > 0) {
                $stmtMove = $pdo->prepare("INSERT INTO stock_movements (product_id, movement_type, quantity, stock_before, stock_after, user_id, reference_id, notes) 
                                           VALUES (?, 'initial', ?, 0, ?, ?, ?, ?)");
                $stmtMove->execute([
                    $product_id,
                    $initial_stock,
                    $initial_stock,
                    $_SESSION['user_id'],
                    "INIT-" . $product_id,
                    "Initial stock recorded on product creation"
                ]);
            }

            $pdo->commit();
            set_flash('success', "Product '{$name}' created successfully!");
            header("Location: products.php");
            exit();
        } catch (Exception $e) {
            $pdo->rollBack();
            $errors[] = "Database error: " . $e->getMessage();
        }
    }
}
?>

<div class="row justify-content-center">
  <div class="col-12 col-lg-8">
    <div class="card">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0 fw-bold"><i class="bi bi-plus-circle text-primary me-2"></i>Add New Product</h5>
        <span class="text-muted small">Enter product specifications and initial inventory stock</span>
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

        <form method="POST" action="product_add.php" enctype="multipart/form-data">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Product Name <span class="text-danger">*</span></label>
              <input type="text" name="name" class="form-control" placeholder="e.g. Slim Fit Denim Jeans" required value="<?= e($_POST['name'] ?? '') ?>">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">SKU (Stock Keeping Unit) <span class="text-danger">*</span></label>
              <input type="text" name="sku" class="form-control text-uppercase font-monospace" placeholder="e.g. JNS-009" required value="<?= e($_POST['sku'] ?? '') ?>">
              <div class="form-text">Must be unique across the catalog</div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Category <span class="text-danger">*</span></label>
              <input type="text" name="category" list="categoryOptions" class="form-control" placeholder="Select or type category" required value="<?= e($_POST['category'] ?? '') ?>">
              <datalist id="categoryOptions">
                <option value="Men Apparel">
                <option value="Women Apparel">
                <option value="Footwear">
                <option value="Accessories">
                <option value="Outerwear">
                <option value="Kids & Baby">
              </datalist>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Selling Price (<?= e($currency) ?>) <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text"><?= e($currency) ?></span>
                <input type="number" step="0.01" min="0" name="selling_price" class="form-control" placeholder="0.00" required value="<?= e($_POST['selling_price'] ?? '') ?>">
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Initial Stock Quantity <span class="text-danger">*</span></label>
              <input type="number" min="0" name="initial_stock" class="form-control" placeholder="0" required value="<?= e($_POST['initial_stock'] ?? '0') ?>">
              <div class="form-text">Initial units present on shelf/warehouse</div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Low-Stock Alert Threshold</label>
              <input type="number" min="0" name="low_stock_threshold" class="form-control" placeholder="10" value="<?= e($_POST['low_stock_threshold'] ?? '10') ?>">
              <div class="form-text">Triggers dashboard warning when stock hits or drops below this</div>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Description</label>
              <textarea name="description" class="form-control" rows="3" placeholder="Product details, fabric, sizing, barcode..."><?= e($_POST['description'] ?? '') ?></textarea>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Product Image (Optional)</label>
              <input type="file" name="image" class="form-control" accept="image/*">
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <a href="products.php" class="btn btn-outline-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary px-4">
              <i class="bi bi-check2-circle me-1"></i>Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
