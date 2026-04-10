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
    //ensure only authorized users modify stock
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
        $userID  = intval($_SESSION['user_id']);
        $success = updateInventoryStock($conn, $skuCode, $newStock, $userID);
        if ($success) {
            echo "Success";
        } else {
            echo "Failed to update item.";
        }
    } else {
        echo "Error: Missing SKUCode.";
    }

} else if ($action == 'restockInventory') {
    //add stock delta to an item and write an audit log entry
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(array('error' => 'Not logged in'));
        exit;
    }

    $skuCode = isset($_POST['skuCode']) ? trim($_POST['skuCode']) : '';
    $addQty  = isset($_POST['addQty'])  ? intval($_POST['addQty']) : 0;
    $note    = isset($_POST['note'])    ? trim($_POST['note']) : '';
    $userID  = intval($_SESSION['user_id']);

    if ($skuCode === '' || $addQty <= 0) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Invalid input. SKU and a positive quantity are required.'));
        exit;
    }

    $newQty = restockInventory($conn, $skuCode, $addQty, $userID, $note);

    header('Content-Type: application/json');
    if ($newQty !== false) {
        echo json_encode(array('success' => true, 'newQty' => $newQty));
    } else {
        echo json_encode(array('error' => 'SKU not found or update failed.'));
    }

} else if ($action == 'getInventoryLogs') {
    //return the full audit trail
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(array());
        exit;
    }

    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $dateFrom = isset($_GET['dateFrom']) ? trim($_GET['dateFrom']) : '';
    $dateTo = isset($_GET['dateTo']) ? trim($_GET['dateTo']) : '';

    $logs = getInventoryLogs($conn, $search, $dateFrom, $dateTo);
    header('Content-Type: application/json');
    echo json_encode($logs);

} else {
    echo "Error: Unrecognized inventory action";
}

