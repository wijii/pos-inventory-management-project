<?php
$conn = mysqli_connect('localhost', 'root', '', 'updatedpos');
if (!$conn) die('Connection failed: ' . mysqli_connect_error());

mysqli_query($conn, "ALTER TABLE transactions ADD COLUMN PaymentMethod ENUM('Cash', 'GCash') NOT NULL DEFAULT 'Cash'");
mysqli_query($conn, "ALTER TABLE transactions ADD COLUMN DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00");

mysqli_query($conn, "ALTER TABLE transactionarchives ADD COLUMN PaymentMethod ENUM('Cash', 'GCash') NOT NULL DEFAULT 'Cash'");
mysqli_query($conn, "ALTER TABLE transactionarchives ADD COLUMN DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00");

echo "Success alters done.";
?>
