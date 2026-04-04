<?php
session_start();

include __DIR__ . '/../config/connect.php';
include __DIR__ . '/../models/InventoryModel.php';

$action = '';
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

if ($action == 'getInventoryJSON') {
    //ensure only logged in users access this
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([]);
        exit;
    }

    $data = getFullInventory($conn);
    header('Content-Type: application/json');
    echo json_encode($data);

} else if ($action == 'updateInventoryStock') {
    // Ensure only authorized users modify stock
    if (!isset($_SESSION['user_id'])) {
        echo "Error: Unauthorized action. Please login.";
        exit;
    }

    $skuCode = '';
    if (isset($_POST['skuCode'])) {
        $skuCode = $_POST['skuCode'];
    }

    $newStock = 0;
    if (isset($_POST['newStock'])) {
        $newStock = intval($_POST['newStock']);
    }

    if ($skuCode !== '') {
        $success = updateInventoryStock($conn, $skuCode, $newStock);
        if ($success) {
            echo "Success";
        } else {
            echo "Failed to update item.";
        }
    } else {
        echo "Error: Missing SKUCode.";
    }

} else {
    echo "Error: Unrecognized inventory action";
}
