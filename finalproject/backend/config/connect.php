<?php


$host = "localhost";
$db_name = "updatedpos";
$username = "root";
$password = "";

//create connection
$conn = mysqli_connect($host, $username, $password, $db_name);

//check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>