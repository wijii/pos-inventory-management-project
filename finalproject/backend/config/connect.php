<?php

// Database Config: Credentials and host used to open the MySQLi connection shared across all controllers.
$host = "localhost";
$db_name = "updatedpos";
$username = "root";
$password = "";

// Connection: Opens a persistent MySQLi link and halts the request if it fails.
$conn = mysqli_connect($host, $username, $password, $db_name);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}