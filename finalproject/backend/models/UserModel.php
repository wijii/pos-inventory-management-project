<?php
// User Authentication: Validates login credentials against the database and manages working status on sign in.
function loginUser($conn, $username, $password)
{
    // find the user by username, and also grab their role name from the roles table
        $sql = "SELECT u.UserID, u.Username, u.Password, u.FirstName, u.LastName, r.RoleName
        FROM users u
        INNER JOIN roles r ON u.RoleID = r.RoleID
        WHERE u.Username = ? OR u.EmailAddress = ? OR CONCAT(u.FirstName, ' ', u.LastName) = ?";

    $stmt = mysqli_prepare($conn, $sql);

    //bind the same input to all three ? placeholders
    mysqli_stmt_bind_param($stmt, "sss", $username, $username, $username);

    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    //check if a user with that username was found
    if (mysqli_num_rows($result) > 0) {

        $row = mysqli_fetch_assoc($result);

        //check if the password the user typed matches the hashed one in the database
        if (password_verify($password, $row['Password'])) {

            $conn->query("UPDATE users SET WorkingStatus = 'Inactive'");

            // Then set this user On Duty
            $stmtUpdate = $conn->prepare("UPDATE users SET WorkingStatus = 'Active' WHERE UserID = ?");
            $stmtUpdate->bind_param("i", $row['UserID']);
            $stmtUpdate->execute();
            $stmtUpdate->close();

            // login success - return all the user info the controller needs
            $userInfo = array();
            $userInfo['status'] = true;
            $userInfo['id'] = $row['UserID'];
            $userInfo['username'] = $row['Username'];
            $userInfo['role'] = $row['RoleName'];
            $userInfo['firstname'] = $row['FirstName'];


            return $userInfo;
        }
    }

    //login failed
    $failResult = array();
    $failResult['status'] = false;

    return $failResult;
}