<?php
session_start();

// Dependencies: Loads the database connection and settings read/write functions.
include __DIR__ . '/../config/connect.php';
include __DIR__ . '/../models/SettingsModel.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Public actions (no session required)
if ($action == 'getStoreSettings') {
    $settings = getSystemSettings($conn);
    echo json_encode($settings);
    exit;
}

// Auth Guard: Rejects any sensitive calls that don't have an active session.
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$userId = $_SESSION['user_id'];

if ($action == 'getUserProfile') {
    $profile = getUserProfile($conn, $userId);
    echo json_encode($profile);
} 
else if ($action == 'saveUserProfile') {
    $firstName = $_POST['firstname'] ?? '';
    $lastName = $_POST['lastname'] ?? '';
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $success = saveUserProfile($conn, $userId, $firstName, $lastName, $username, $email, $password);
    echo json_encode(['success' => $success]);
}
else if ($action == 'saveStoreSettings') {
    $storeName = $_POST['storeName'] ?? '';
    $storeEmail = $_POST['storeEmail'] ?? '';
    $contactNum = $_POST['contactNumber'] ?? '';

    $success = saveSystemSettings($conn, [
        'storeName' => $storeName,
        'storeEmail' => $storeEmail,
        'contactNumber' => $contactNum
    ]);
    echo json_encode(['success' => $success]);
}
else if ($action == 'saveTaxSettings') {
    $taxRate = $_POST['taxRate'] ?? '0';
    $stockAlert = $_POST['stockAlert'] ?? '0';

    $success = saveSystemSettings($conn, [
        'taxRate' => $taxRate,
        'stockAlert' => $stockAlert
    ]);
    echo json_encode(['success' => $success]);
}
else {
    echo json_encode(['error' => 'Invalid action']);
}
