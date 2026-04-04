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
} else if ($action == 'getInventoryJSON' || $action == 'updateInventoryStock') {
    require 'controllers/InventoryController.php';
} else {
    echo "Error: The requested action was not found.";
}