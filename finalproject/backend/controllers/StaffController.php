<?php
require_once __DIR__ . '/../config/connect.php';
require_once __DIR__ . '/../models/StaffModel.php';


$action = $_GET['action'] ?? '';

switch ($action) {
  case 'addStaff':
    $roleID     = $_POST['roleID'] ?? '';
    $username   = $_POST['username'] ?? '';
    $password   = $_POST['password'] ?? '';
    $firstName  = $_POST['firstName'] ?? '';
    $lastName   = $_POST['lastName'] ?? '';
    $phoneNo    = $_POST['phoneNo'] ?? '';
    $email      = $_POST['emailAddress'] ?? '';
    $status     = $_POST['workingStatus'] ?? 'Inactive';

    $result = StaffModel::addStaff($roleID, $username, $password, $firstName, $lastName, $phoneNo, $email, $status);
    echo json_encode(['success' => $result]);
    break;

   case 'deleteStaff':
    $id = $_POST['UserID'] ?? 0; // ✅ must match frontend
    $result = StaffModel::deleteStaff($id);
    echo json_encode(['success' => $result]);
    break;

  case 'getStaffList':
    $list = StaffModel::getStaffList();
    echo json_encode($list);
    break;

  default:
    echo json_encode(['error' => 'Invalid action']);
}
?>
