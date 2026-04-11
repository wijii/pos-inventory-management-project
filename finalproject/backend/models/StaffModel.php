<?php
require_once __DIR__ . '/../config/connect.php';

class StaffModel {
    public static function getStaffList() {
        global $conn;
        
        $sql = "SELECT u.UserID, u.FirstName, u.LastName, r.RoleName, u.EmailAddress, u.PhoneNo, u.WorkingStatus 
                FROM users u
                LEFT JOIN roles r ON u.RoleID = r.RoleID";
        
        $result = $conn->query($sql);
        
        $staffData = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Formatting data to match what the frontend expects
                $fullName = trim($row['FirstName'] . ' ' . $row['LastName']);
                
                $staffData[] = [
                    'id' => $row['UserID'],
                    'name' => $fullName,
                    'role' => $row['RoleName'] ?? 'Unknown',
                    'email' => $row['EmailAddress'],
                    'phone' => $row['PhoneNo'],
                    'status' => strtolower($row['WorkingStatus']), // 'active' or 'inactive'
                ];
            }
        }
        return $staffData;
    }

    public static function addStaff($firstName, $lastName, $username, $roleName, $email, $phone, $password) {
        global $conn;
        
        // 1. Role ID mapping
        $roleID = ($roleName === 'Manager') ? 1 : 2;
        
        // 2. Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        // 3. Initial status
        $status = 'Inactive';
        
        // 4. Insert
        $stmt = $conn->prepare("INSERT INTO users (RoleID, Username, Password, FirstName, LastName, PhoneNo, EmailAddress, WorkingStatus) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssssss", $roleID, $username, $hashedPassword, $firstName, $lastName, $phone, $email, $status);
        
        $success = $stmt->execute();
        $stmt->close();
        
        return $success;
    }

    public static function deleteStaff($userId) {
        global $conn;

        // Ensure we don't delete an active user
        $stmt = $conn->prepare("SELECT WorkingStatus FROM users WHERE UserID = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $stmt->bind_result($status);
        $stmt->fetch();
        $stmt->close();

        if ($status === 'Active') {
            return false;
        }

        $stmtDelete = $conn->prepare("DELETE FROM users WHERE UserID = ?");
        $stmtDelete->bind_param("i", $userId);
        $success = $stmtDelete->execute();
        $stmtDelete->close();
        
        return $success;
    }
}
