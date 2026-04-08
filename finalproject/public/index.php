<?php
/**
 * index.php — Public entry point for the POS System
 *
 * Visiting /finalproject/public/ (or /finalproject/public/index.php)
 * will:
 *   - Redirect logged-in Managers  → dashboard.html
 *   - Redirect logged-in Cashiers  → cashier.html (POS)
 *   - Redirect everyone else        → login.html
 */

session_start();

// ── Resolve paths relative to this file ────────────────────────────────────
$base = '../frontend/views/';

// ── Check session ───────────────────────────────────────────────────────────
if (isset($_SESSION['user_id']) && isset($_SESSION['role'])) {

    $role = strtolower($_SESSION['role']);

    if ($role === 'manager' || $role === 'admin') {
        header('Location: ' . $base . 'dashboard.html');
        exit;
    }

    if ($role === 'cashier') {
        header('Location: ' . $base . 'cashier.html');
        exit;
    }
}

// ── Not logged in → send to login ──────────────────────────────────────────
header('Location: ' . $base . 'login.html');
exit;
