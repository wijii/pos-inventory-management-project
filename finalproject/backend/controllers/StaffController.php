<?php
session_start();

// Dependencies: Loads the database connection and the StaffModel class.
require_once __DIR__ . '/../config/connect.php';
require_once __DIR__ . '/../models/StaffModel.php';

if (isset($_GET['action'])) {
    $action = $_GET['action'];
} else {
    $action = '';
}

switch ($action) {
    case 'getStaffList':
        $staffData = StaffModel::getStaffList();
        header('Content-Type: application/json');
        echo json_encode($staffData);
        break;

    case 'addStaff':
        $firstname = $_POST['firstname'] ?? '';
        $lastname = $_POST['lastname'] ?? '';
        $username = $_POST['username'] ?? '';
        $role = $_POST['role'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $password = $_POST['password'] ?? '';

        if (!$firstname || !$lastname || !$username || !$role || !$email || !$password) {
            echo json_encode(['success' => false, 'message' => 'Missing fields']);
            exit;
        }

        $result = StaffModel::addStaff($firstname, $lastname, $username, $role, $email, $phone, $password);
        echo json_encode(['success' => $result]);
        break;

    case 'deleteStaff':
        $id = $_POST['userId'] ?? 0;
        
        $result = StaffModel::deleteStaff($id);
        echo json_encode(['success' => $result]);
        break;
}
