<?php

session_start();

$base = '../frontend/views/';


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

header('Location: ' . $base . 'login.html');
exit;
