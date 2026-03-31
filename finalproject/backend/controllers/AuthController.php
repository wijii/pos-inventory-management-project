<?php
// backend/controllers/AuthController.php
session_start();

// Includes (using __DIR__ so paths are always correct regardless of routes.php inclusion)
include_once __DIR__ . '/../config/connect.php';
include_once __DIR__ . '/../models/UserModel.php';

// Get posted data from frontend using standard $_POST (since we are using jQuery $.ajax)
$username = '';
$password = '';

if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
}

// Ensure they aren't empty
if (!empty($username) && !empty($password)) {

    // Call the function we made in UserModel.php, passing the $conn from connect.php
    $loginResult = loginUser($conn, $username, $password);

    if ($loginResult['status'] == true) {
        // Save info in session
        $_SESSION['user_id'] = $loginResult['id'];
        $_SESSION['username'] = $loginResult['username'];
        $_SESSION['role'] = $loginResult['role'];  // Manager or Cashier
        $_SESSION['firstname'] = $loginResult['firstname'];

        // We simply echo the role so the AJAX success function can read it as plain text!
        echo $loginResult['role'];
    } else {
        // Echo a simple fail message
        echo "Failed";
    }
} else {
    echo "Incomplete";
}
?>