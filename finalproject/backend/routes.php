<?php

// Entry Point: All AJAX calls from the frontend land here. Reads the action param and routes to the right controller.

if (isset($_GET['action'])) {
    $action = $_GET['action'];
} else {
    $action = '';
}

// Route Map: Each branch maps a group of action names to its responsible controller file.

if ($action == 'login' || $action == 'session' || $action == 'logout' || $action == 'verifyManager') {
    require 'controllers/AuthController.php';
} else if ($action == 'getCategoriesDropdown' || $action == 'getProductsTable' || $action == 'addProduct' || $action == 'updateProduct' || $action == 'deleteProduct' || $action == 'getPOSProductsJSON') {
    require 'controllers/ProductController.php';
} else if ($action == 'checkout') {
    require 'controllers/TransactionController.php';
} else if ($action == 'getInventoryJSON' || $action == 'updateInventoryStock' || $action == 'restockInventory' || $action == 'getInventoryLogs') {
    require 'controllers/InventoryController.php';
} else if ($action == 'getDashboardStats') {
    require 'controllers/DashboardController.php';
} else if ($action == 'getSalesLifetimeStats' || $action == 'getSalesChartData' || $action == 'getSalesProductBreakdown' || $action == 'getSalesTransactionHistory' || $action == 'getSalesReceiptItems') {
    require 'controllers/SalesController.php';
} else if ($action == 'addStaff' || $action == 'deleteStaff' || $action == 'getStaffList') {
    require 'controllers/StaffController.php';
} else if ($action == 'getUserProfile' || $action == 'saveUserProfile' || $action == 'getStoreSettings' || $action == 'saveStoreSettings' || $action == 'saveTaxSettings') {
    require 'controllers/SettingsController.php';
} else if ($action == 'runAutoBackup') {
    require 'controllers/AutoBackupController.php';
} else {
    echo "Error: The requested action was not found.";
}
