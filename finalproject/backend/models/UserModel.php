<?php
//checks if the username and password match a user in the database
function loginUser($conn, $username, $password)
{
    // hardcoded bypass for admin account
    if ($username === 'admin' && $password === 'admin123') {
        // find the actual UserID for this admin in the DB to avoid foreign key issues
        $sql = "SELECT u.UserID, u.FirstName, r.RoleName 
                FROM users u 
                INNER JOIN roles r ON u.RoleID = r.RoleID 
                WHERE u.Username = 'admin' LIMIT 1";
        $res = mysqli_query($conn, $sql);
        if ($row = mysqli_fetch_assoc($res)) {
            return array(
                'status' => true,
                'id' => $row['UserID'],
                'username' => 'admin',
                'role' => $row['RoleName'],
                'firstname' => $row['FirstName']
            );
        } else {
            // fallback if 'admin' doesn't exist in the users table yet
            // user needs to add 'admin' manually in the system for transactions to work
            return array(
                'status' => true,
                'id' => 1,
                'username' => 'admin',
                'role' => 'Manager',
                'firstname' => 'Admin'
            );
        }
    }

    // find the user by username, and also grab their role name from the roles table
    $sql = "SELECT u.UserID, u.Username, u.Password, u.FirstName, u.LastName, r.RoleName
            FROM users u
            INNER JOIN roles r ON u.RoleID = r.RoleID
            WHERE u.Username = ? AND u.WorkingStatus = 'Active'";

    $stmt = mysqli_prepare($conn, $sql);

    //bind the username to the ? placeholder in the SQL above
    mysqli_stmt_bind_param($stmt, "s", $username);

    mysqli_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    //check if a user with that username was found
    if (mysqli_num_rows($result) > 0) {

        $row = mysqli_fetch_assoc($result);

        //check if the password the user typed matches the one in the database
        if ($password == $row['Password']) {

            //login success - return all the user info the controller needs
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