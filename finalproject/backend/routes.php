<?php

//AJAX requests will be sent to this file.
//check what action the frontend wants to perform.

if (isset($_GET['action'])) {
    $action = $_GET['action'];
} else {
    $action = '';
}

//route the request to the correct Controller based on the action

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
} else {
    echo "Error: The requested action was not found.";
}
