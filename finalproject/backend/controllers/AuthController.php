<?php

session_start();

// Includes (using __DIR__ so paths are always correct regardless of routes.php inclusion)
include __DIR__ . '/../config/connect.php';
include __DIR__ . '/../models/UserModel.php';

//verify manager password 
if (isset($_GET['action']) && $_GET['action'] == 'verifyManager') {
    $password = $_POST['password'];

    //check if any active user with Manager role has this password
    $sql = "SELECT u.UserID FROM users u 
            INNER JOIN roles r ON u.RoleID = r.RoleID 
            WHERE u.Password = ? AND r.RoleName = 'Manager' AND u.WorkingStatus = 'Active'";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $password);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) > 0) {
        echo "Success";
    } else {
        echo "Failed";
    }
    exit;
}

//logout action to destroy the session
if (isset($_GET['action']) && $_GET['action'] == 'logout') {
    session_unset();
    session_destroy();
    echo "Success";
    exit;
}

//AJAX action to retrieve session info
if (isset($_GET['action']) && $_GET['action'] == 'session') {
    header('Content-Type: application/json');
    if (isset($_SESSION['role'])) {
        echo json_encode(array(
            "role" => $_SESSION['role'],
            "firstname" => $_SESSION['firstname']
        ));
    } else {
        echo json_encode(array("role" => "Guest", "firstname" => "Unauthorized"));
    }
    exit;
}

//handle login post
if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
}

//wnsure they aren't empty
if (!empty($username) && !empty($password)) {

    //call the function in UserModel.php, passing the $conn from connect.php
    $loginResult = loginUser($conn, $username, $password);

    if ($loginResult['status'] == true) {
        //save info in session
        $_SESSION['user_id'] = $loginResult['id'];
        $_SESSION['username'] = $loginResult['username'];
        $_SESSION['role'] = $loginResult['role'];  // Manager or Cashier
        $_SESSION['firstname'] = $loginResult['firstname'];

        //echo the role so the AJAX success function can read it as plain text!
        echo $loginResult['role'];
    } else {
        echo "Failed";
    }
} else {
    echo "Incomplete";
}