<?php
$page_title = 'Product Management';
require_once __DIR__ . '/includes/header.php';

$currency = $app_settings['currency'] ?? 'Rs.';

// Handle archive / restore actions
if (isset($_GET['action']) && isset($_GET['id'])) {
    $action = $_GET['action'];
    $prod_id = (int)$_GET['id'];

    if ($action === 'archive') {
        $stmt = $pdo->prepare("UPDATE products SET archived_at = NOW() WHERE id = ?");
        $stmt->execute([$prod_id]);
        set_flash('success', "Product archived successfully.");
        header("Location: products.php");
        exit();
    } elseif ($action === 'restore') {
        $stmt = $pdo->prepare("UPDATE products SET archived_at = NULL WHERE id = ?");
        $stmt->execute([$prod_id]);
        set_flash('success', "Product restored successfully.");
        header("Location: products.php");
        exit();
    }
}

// Search and filter parameters
$search = trim($_GET['search'] ?? '');
$category = trim($_GET['category'] ?? '');
$status = trim($_GET['status'] ?? 'active');

$query = "SELECT * FROM products WHERE 1=1";
$params = [];

if ($status === 'archived') {
    $query .= " AND archived_at IS NOT NULL";
} else {
    $query .= " AND archived_at IS NULL";
}

if (!empty($search)) {
    $query .= " AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

if (!empty($category)) {
    $query .= " AND category = ?";
    $params[] = $category;
}

$query .= " ORDER BY id DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Get unique categories for dropdown filter
$catStmt = $pdo->query("SELECT DISTINCT category FROM products ORDER BY category ASC");
$categories = $catStmt->fetchAll(PDO::FETCH_COLUMN);
?>

<div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
  <div>
    <h5 class="fw-bold mb-1">Product Catalog</h5>
    <p class="text-muted small mb-0">Manage items, stock thresholds, prices, and categories</p>
  </div>
  <div class="d-flex gap-2">
    <a href="product_add.php" class="btn btn-primary">
      <i class="bi bi-plus-lg me-1"></i>Add New Product
    </a>
  </div>
</div>

<!-- Filters Card -->
<div class="card mb-4">
  <div class="card-body p-3">
    <form method="GET" class="row g-2 align-items-center">
      <div class="col-12 col-md-5">
        <div class="input-group">
          <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
          <input type="text" name="search" class="form-control" placeholder="Search by name, SKU, or keyword..." value="<?= e($search) ?>">
        </div>
      </div>
      
      <div class="col-6 col-md-3">
        <select name="category" class="form-select">
          <option value="">All Categories</option>
          <?php foreach ($categories as $cat): ?>
            <option value="<?= e($cat) ?>" <?= ($category === $cat) ? 'selected' : '' ?>><?= e($cat) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="col-6 col-md-2">
        <select name="status" class="form-select">
          <option value="active" <?= ($status === 'active') ? 'selected' : '' ?>>Active Only</option>
          <option value="archived" <?= ($status === 'archived') ? 'selected' : '' ?>>Archived</option>
        </select>
      </div>

      <div class="col-12 col-md-2 d-flex gap-1">
        <button type="submit" class="btn btn-primary w-100">Filter</button>
        <?php if (!empty($search) || !empty($category) || $status === 'archived'): ?>
          <a href="products.php" class="btn btn-outline-secondary" title="Reset Filters"><i class="bi bi-arrow-counterclockwise"></i></a>
        <?php endif; ?>
      </div>
    </form>
  </div>
</div>

<!-- Products Table -->
<div class="card">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th style="width: 70px;">ID</th>
          <th>SKU</th>
          <th>Product Name</th>
          <th>Category</th>
          <th class="text-end">Selling Price</th>
          <th class="text-center">Current Stock</th>
          <th class="text-center">Status</th>
          <th class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($products)): ?>
          <tr>
            <td colspan="8" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              No products found matching your search.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($products as $p): ?>
            <tr>
              <td class="text-muted fw-bold">#<?= $p['id'] ?></td>
              <td><code><?= e($p['sku']) ?></code></td>
              <td>
                <div class="fw-semibold text-dark"><?= e($p['name']) ?></div>
                <?php if (!empty($p['description'])): ?>
                  <div class="text-muted small text-truncate" style="max-width: 280px;"><?= e($p['description']) ?></div>
                <?php endif; ?>
              </td>
              <td><span class="badge bg-light text-dark border"><?= e($p['category']) ?></span></td>
              <td class="text-end fw-bold"><?= e($currency) ?> <?= number_format($p['selling_price'], 2) ?></td>
              <td class="text-center">
                <span class="fw-bold fs-6 <?= ($p['current_stock'] == 0) ? 'text-danger' : (($p['current_stock'] <= $p['low_stock_threshold']) ? 'text-warning' : 'text-dark') ?>">
                  <?= $p['current_stock'] ?>
                </span>
                <span class="text-muted small"> units</span>
              </td>
              <td class="text-center">
                <?php if ($p['current_stock'] == 0): ?>
                  <span class="badge bg-danger">Out of Stock</span>
                <?php elseif ($p['current_stock'] <= $p['low_stock_threshold']): ?>
                  <span class="badge bg-warning text-dark">Low Stock (≤ <?= $p['low_stock_threshold'] ?>)</span>
                <?php else: ?>
                  <span class="badge bg-success-subtle text-success border border-success-subtle">In Stock</span>
                <?php endif; ?>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <a href="stock.php?product_id=<?= $p['id'] ?>" class="btn btn-outline-success" title="Add Stock / Restock">
                    <i class="bi bi-plus-slash-minus"></i>
                  </a>
                  <a href="product_edit.php?id=<?= $p['id'] ?>" class="btn btn-outline-primary" title="Edit Product">
                    <i class="bi bi-pencil"></i>
                  </a>
                  <?php if ($p['archived_at']): ?>
                    <a href="products.php?action=restore&id=<?= $p['id'] ?>" class="btn btn-outline-secondary" title="Restore Product" onclick="return confirm('Restore this product to active catalog?');">
                      <i class="bi bi-arrow-up-circle"></i>
                    </a>
                  <?php else: ?>
                    <a href="products.php?action=archive&id=<?= $p['id'] ?>" class="btn btn-outline-danger" title="Archive Product" onclick="return confirm('Archive this product? It will be hidden from new sales.');">
                      <i class="bi bi-archive"></i>
                    </a>
                  <?php endif; ?>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
