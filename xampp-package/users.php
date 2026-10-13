<?php
$page_title = 'User Management';
require_once __DIR__ . '/includes/header.php';
require_admin(); // Restrict to admin only

$errors = [];

// Handle New User Creation
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_user') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = "CSRF verification failed.";
    }

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'staff';

    if (empty($name)) $errors[] = "Name is required.";
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email is required.";
    if (strlen($password) < 6) $errors[] = "Password must be at least 6 characters long.";
    if (!in_array($role, ['admin', 'staff'])) $role = 'staff';

    // Check unique email
    if (empty($errors)) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $errors[] = "A user with this email address already exists.";
        }
    }

    if (empty($errors)) {
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)");
        $stmt->execute([$name, $email, $hashed, $role]);
        set_flash('success', "New user '{$name}' created successfully with role '{$role}'.");
        header("Location: users.php");
        exit();
    }
}

// Handle Status Toggle
if (isset($_GET['toggle_id'])) {
    $toggle_id = (int)$_GET['toggle_id'];
    if ($toggle_id === (int)$_SESSION['user_id']) {
        set_flash('error', "You cannot deactivate your own administrative account.");
    } else {
        $stmt = $pdo->prepare("UPDATE users SET is_active = (1 - is_active) WHERE id = ?");
        $stmt->execute([$toggle_id]);
        set_flash('success', "User account status updated.");
    }
    header("Location: users.php");
    exit();
}

$stmt = $pdo->query("SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id ASC");
$users = $stmt->fetchAll();
?>

<div class="row g-4 mb-4">
  <div class="col-12 col-lg-8">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <h6 class="mb-0 fw-bold"><i class="bi bi-people-fill text-primary me-2"></i>Registered System Users</h6>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($users as $u): ?>
              <tr>
                <td class="fw-semibold text-dark">
                  <div class="d-flex align-items-center gap-2">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.85rem;">
                      <?= strtoupper(substr($u['name'], 0, 1)) ?>
                    </div>
                    <span><?= e($u['name']) ?></span>
                  </div>
                </td>
                <td><?= e($u['email']) ?></td>
                <td>
                  <?php if ($u['role'] === 'admin'): ?>
                    <span class="badge bg-purple text-white" style="background-color: #7c3aed;">Administrator</span>
                  <?php else: ?>
                    <span class="badge bg-secondary">Staff Member</span>
                  <?php endif; ?>
                </td>
                <td>
                  <?php if ($u['is_active']): ?>
                    <span class="badge bg-success-subtle text-success">Active</span>
                  <?php else: ?>
                    <span class="badge bg-danger-subtle text-danger">Suspended</span>
                  <?php endif; ?>
                </td>
                <td class="text-muted small"><?= date('M d, Y', strtotime($u['created_at'])) ?></td>
                <td class="text-end">
                  <?php if ($u['id'] !== (int)$_SESSION['user_id']): ?>
                    <a href="users.php?toggle_id=<?= $u['id'] ?>" class="btn btn-sm <?= ($u['is_active']) ? 'btn-outline-danger' : 'btn-outline-success' ?>" onclick="return confirm('Change active status for this user?');">
                      <?= ($u['is_active']) ? 'Deactivate' : 'Activate' ?>
                    </a>
                  <?php else: ?>
                    <span class="badge bg-light text-muted border">Current User</span>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Add User Form -->
  <div class="col-12 col-lg-4">
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <h6 class="mb-0 fw-bold"><i class="bi bi-person-plus-fill text-success me-2"></i>Create New User</h6>
      </div>
      <div class="card-body p-3">
        <?php if (!empty($errors)): ?>
          <div class="alert alert-danger py-2 small">
            <?php foreach ($errors as $er): ?>
              <div><?= e($er) ?></div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>

        <form method="POST" action="users.php">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
          <input type="hidden" name="action" value="add_user">

          <div class="mb-3">
            <label class="form-label small fw-semibold">Full Name</label>
            <input type="text" name="name" class="form-control" placeholder="e.g. Nimal Fernando" required value="<?= e($_POST['name'] ?? '') ?>">
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Email Address</label>
            <input type="email" name="email" class="form-control" placeholder="nimal@retail.com" required value="<?= e($_POST['email'] ?? '') ?>">
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Password</label>
            <input type="password" name="password" class="form-control" placeholder="At least 6 characters" required>
            <div class="form-text">Secured with PHP password_hash() BCRYPT</div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold">Access Role</label>
            <select name="role" class="form-select">
              <option value="staff">Staff (Sales &amp; Stock View)</option>
              <option value="admin">Administrator (Full Control)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-100">
            <i class="bi bi-person-check me-1"></i>Create Account
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
