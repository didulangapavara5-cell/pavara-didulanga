<?php
$page_title = 'System & Business Settings';
require_once __DIR__ . '/includes/header.php';
require_admin();

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = "CSRF verification failed.";
    }

    $business_name = trim($_POST['business_name'] ?? '');
    $currency = trim($_POST['currency'] ?? 'Rs.');
    $timezone = trim($_POST['timezone'] ?? 'Asia/Colombo');
    $business_address = trim($_POST['business_address'] ?? '');
    $contact_number = trim($_POST['contact_number'] ?? '');
    $email = trim($_POST['email'] ?? '');

    if (empty($business_name)) $errors[] = "Business name cannot be empty.";
    if (empty($currency)) $errors[] = "Currency symbol cannot be empty.";

    if (empty($errors)) {
        $stmt = $pdo->prepare("UPDATE settings SET business_name = ?, currency = ?, timezone = ?, business_address = ?, contact_number = ?, email = ? WHERE id = 1");
        $stmt->execute([
            $business_name,
            $currency,
            $timezone,
            $business_address,
            $contact_number,
            $email
        ]);
        set_flash('success', "Business settings saved successfully.");
        header("Location: settings.php");
        exit();
    }
}

// Reload updated settings
$stmt = $pdo->query("SELECT * FROM settings WHERE id = 1 LIMIT 1");
$current_settings = $stmt->fetch() ?: $app_settings;
?>

<div class="row justify-content-center">
  <div class="col-12 col-lg-8">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <h6 class="mb-0 fw-bold"><i class="bi bi-sliders text-primary me-2"></i>Business Profile &amp; General Configuration</h6>
        <span class="text-muted small">Configure store identity, printed report headers, currency, and timezone</span>
      </div>
      <div class="card-body p-4">
        <?php if (!empty($errors)): ?>
          <div class="alert alert-danger py-2 small">
            <?php foreach ($errors as $er): ?>
              <div><?= e($er) ?></div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>

        <form method="POST" action="settings.php">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Business Name <span class="text-danger">*</span></label>
              <input type="text" name="business_name" class="form-control" required value="<?= e($current_settings['business_name']) ?>">
              <div class="form-text">Appears on invoices and daily printable reports</div>
            </div>

            <div class="col-12 col-md-3">
              <label class="form-label fw-semibold">Currency Symbol <span class="text-danger">*</span></label>
              <input type="text" name="currency" class="form-control" required value="<?= e($current_settings['currency']) ?>">
              <div class="form-text">e.g. Rs. or LKR or $</div>
            </div>

            <div class="col-12 col-md-3">
              <label class="form-label fw-semibold">Timezone <span class="text-danger">*</span></label>
              <select name="timezone" class="form-select">
                <option value="Asia/Colombo" <?= ($current_settings['timezone'] === 'Asia/Colombo') ? 'selected' : '' ?>>Asia/Colombo (Sri Lanka)</option>
                <option value="Asia/Kolkata" <?= ($current_settings['timezone'] === 'Asia/Kolkata') ? 'selected' : '' ?>>Asia/Kolkata (IST)</option>
                <option value="UTC" <?= ($current_settings['timezone'] === 'UTC') ? 'selected' : '' ?>>UTC (Coordinated)</option>
                <option value="America/New_York" <?= ($current_settings['timezone'] === 'America/New_York') ? 'selected' : '' ?>>America/New_York</option>
                <option value="Europe/London" <?= ($current_settings['timezone'] === 'Europe/London') ? 'selected' : '' ?>>Europe/London</option>
              </select>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Contact Phone Number</label>
              <input type="text" name="contact_number" class="form-control" value="<?= e($current_settings['contact_number']) ?>">
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Official Email</label>
              <input type="email" name="email" class="form-control" value="<?= e($current_settings['email']) ?>">
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Business Address</label>
              <textarea name="business_address" class="form-control" rows="3"><?= e($current_settings['business_address']) ?></textarea>
              <div class="form-text">Printed on the header of the official Daily Sales &amp; Stock Report</div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button type="submit" class="btn btn-primary px-4">
              <i class="bi bi-save me-1"></i>Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
