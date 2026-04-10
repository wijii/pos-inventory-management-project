<?php

session_start();

include __DIR__ . '/../config/connect.php';
include __DIR__ . '/../models/SalesModel.php';

//only logged-in users may access sales data
if (!isset($_SESSION['user_id'])) {
    echo json_encode(array('error' => 'Not logged in'));
    exit;
}

$action = '';
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

if ($action === 'getSalesLifetimeStats') {

    $data = getSalesLifetimeStats($conn);
    header('Content-Type: application/json');
    echo json_encode($data);

} else if ($action === 'getSalesChartData') {

    $period = 'daily';
    if (isset($_GET['period']) && in_array($_GET['period'], array('daily', 'weekly', 'monthly'))) {
        $period = $_GET['period'];
    }

    $data = getSalesChartData($conn, $period);
    header('Content-Type: application/json');
    echo json_encode($data);

} else if ($action === 'getSalesProductBreakdown') {

    $data = getSalesProductBreakdown($conn);
    header('Content-Type: application/json');
    echo json_encode($data);

} else if ($action === 'getSalesTransactionHistory') {

    $data = getSalesTransactionHistory($conn);
    header('Content-Type: application/json');
    echo json_encode($data);

} else if ($action === 'getSalesReceiptItems') {

    $transactionID = 0;
    if (isset($_GET['transactionID'])) {
        $transactionID = intval($_GET['transactionID']);
    }

    if ($transactionID <= 0) {
        echo json_encode(array('error' => 'Invalid transaction ID'));
        exit;
    }

    $items = getSalesReceiptItems($conn, $transactionID);
    header('Content-Type: application/json');
    echo json_encode($items);

} else {
    echo json_encode(array('error' => 'Unrecognized sales action'));
}
