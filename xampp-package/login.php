<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

if (is_logged_in()) {
    header("Location: dashboard.php");
    exit();
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $token = $_POST['csrf_token'] ?? '';

    if (!verify_csrf_token($token)) {
        $error = "Security validation failed. Please refresh the page.";
    } elseif (empty($email) || empty($password)) {
        $error = "Please enter both email and password.";
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Regenerate session ID for security against session fixation
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            
            set_flash('success', "Welcome back, " . $user['name'] . "!");
            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Invalid email address or password.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - <?= e($app_settings['business_name'] ?? 'Apex Retail') ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .login-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 440px;
      padding: 2.25rem;
    }
    .brand-icon {
      width: 54px;
      height: 54px;
      border-radius: 12px;
      background: #2563eb;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      margin: 0 auto 1rem;
    }
  </style>
</head>
<body>

<div class="login-card">
  <div class="text-center mb-4">
    <div class="brand-icon">
      <i class="bi bi-box-seam-fill"></i>
    </div>
    <h4 class="fw-bold text-dark mb-1"><?= e($app_settings['business_name'] ?? 'Apex Retail & Mart') ?></h4>
    <p class="text-muted small">Smart Inventory & Daily Sales Management</p>
  </div>

  <?php if (!empty($error)): ?>
    <div class="alert alert-danger py-2 small d-flex align-items-center" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2 fs-6"></i>
      <div><?= e($error) ?></div>
    </div>
  <?php endif; ?>

  <form method="POST" action="login.php">
    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

    <div class="mb-3">
      <label class="form-label small fw-semibold text-secondary">Email Address</label>
      <div class="input-group">
        <span class="input-group-text bg-light text-muted"><i class="bi bi-envelope"></i></span>
        <input type="email" name="email" class="form-control" placeholder="name@retail.com" required value="<?= e($_POST['email'] ?? 'admin@retail.com') ?>">
      </div>
    </div>

    <div class="mb-4">
      <label class="form-label small fw-semibold text-secondary">Password</label>
      <div class="input-group">
        <span class="input-group-text bg-light text-muted"><i class="bi bi-lock"></i></span>
        <input type="password" name="password" class="form-control" placeholder="••••••••" required value="admin123">
      </div>
    </div>

    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">
      <i class="bi bi-box-arrow-in-right me-2"></i>Sign In to Dashboard
    </button>
  </form>

  <div class="mt-4 pt-3 border-top text-center">
    <div class="text-muted small mb-2">Default Demo Credentials:</div>
    <div class="d-flex justify-content-center gap-2">
      <button class="btn btn-sm btn-outline-secondary" onclick="fillCreds('admin@retail.com', 'admin123')">
        <i class="bi bi-shield-lock me-1"></i>Admin
      </button>
      <button class="btn btn-sm btn-outline-secondary" onclick="fillCreds('staff@retail.com', 'staff123')">
        <i class="bi bi-person me-1"></i>Staff
      </button>
    </div>
  </div>
</div>

<script>
function fillCreds(email, pass) {
  document.querySelector('input[name="email"]').value = email;
  document.querySelector('input[name="password"]').value = pass;
}
</script>
</body>
</html>
