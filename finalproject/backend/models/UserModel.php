<?php

function loginUser($conn, $username, $password)
{
    $sql = "SELECT u.UserID, u.Username, u.Password, u.FirstName, u.LastName, r.RoleName 
            FROM users u
            INNER JOIN roles r ON u.RoleID = r.RoleID
            WHERE u.Username = ? AND u.WorkingStatus = 'Active'";


    $stmt = mysqli_prepare($conn, $sql);

    mysqli_stmt_bind_param($stmt, "s", $username);

    mysqli_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    // if 1 user lang 
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);

        //pag password matches
        if ($password == $row['Password']) {
            return array(
                "status" => true,
                "id" => $row['UserID'],
                "username" => $row['Username'],
                "role" => $row['RoleName'],
                "firstname" => $row['FirstName']
            );
        }
    }

    // false if failed
    return array("status" => false);
}
?>