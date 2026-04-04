<?php
session_start();

include __DIR__ . '/../config/connect.php';
include __DIR__ . '/../models/TransactionModel.php';

$action = '';
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

if ($action == 'checkout') {
    //only logged in users can checkout
    if (!isset($_SESSION['user_id'])) {
        echo "Error: Not logged in";
        exit;
    }

    $userID = $_SESSION['user_id'];
    
    $amountPaid = 0;
    if (isset($_POST['amountPaid'])) {
        $amountPaid = floatval($_POST['amountPaid']);
    }

    $totalAmountDue = 0;
    if (isset($_POST['totalAmountDue'])) {
        $totalAmountDue = floatval($_POST['totalAmountDue']);
    }

    // automatically grabbed from jquery ajax
    $cartItems = array();
    if (isset($_POST['cartItems'])) {
        $cartItems = $_POST['cartItems']; 
    }

    if (empty($cartItems)) {
        echo "Error: Cart is empty";
        exit;
    }

    $result = processCheckout($conn, $userID, $amountPaid, $totalAmountDue, $cartItems);

    if ($result['success']) {
        echo "Success:" . $result['transactionID'];
    } else {
        echo "Failed: " . $result['message'];
    }
} else {
    echo "Error: Unrecognized transaction action";
}
