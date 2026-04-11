<?php
require_once __DIR__ . '/../config/connect.php';

class StaffModel {
    public static function addStaff($roleID, $username, $password, $firstName, $lastName, $phoneNo, $email, $status) {
        global $conn;
        $stmt = $conn->prepare("INSERT INTO users (RoleID, Username, Password, FirstName, LastName, PhoneNo, EmailAddress, WorkingStatus) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssssss", $roleID, $username, $password, $firstName, $lastName, $phoneNo, $email, $status);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function setOnDuty($userId) {
        global $conn;

        // set everyone else to Inactive
        $conn->query("UPDATE users SET WorkingStatus = 'Inactive'");

        // set the user to Active
        $stmt = $conn->prepare("UPDATE users SET WorkingStatus = 'Active' WHERE UserID = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->close();
    }

    public static function deleteStaff($id) {
        global $conn;

        // Check if this user is Active
        $stmt = $conn->prepare("SELECT WorkingStatus FROM users WHERE UserID = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($status);
        $stmt->fetch();
        $stmt->close();

        if ($status === 'Active') {
        // Don’t allow deletion
        return false;
    }

    // Otherwise delete
    $stmt = $conn->prepare("DELETE FROM users WHERE UserID = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $deletedRows = $stmt->affected_rows;
    $stmt->close();

    return $deletedRows > 0;
}

  public static function getStaffList() {
    global $conn;
    $result = $conn->query("SELECT UserID, RoleID, Username, FirstName, LastName, PhoneNo, EmailAddress, WorkingStatus FROM users");
    $staffList = $result->fetch_all(MYSQLI_ASSOC);
    return $staffList;
  }
}
