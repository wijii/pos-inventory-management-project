<?php
$conn = mysqli_connect('localhost', 'root', '', 'updatedpos');
if (!$conn) die('Connection failed: ' . mysqli_connect_error());

$sql = "SELECT UserID, Password FROM users";
$result = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($result)) {
    // only hash if it's not already a bcrypt hash (bcrypt hashes starts with $2y$ and are 60 chars long)
    if (strlen($row['Password']) < 60 || substr($row['Password'], 0, 4) !== '$2y$') {
        $hashed = password_hash($row['Password'], PASSWORD_DEFAULT);
        $updateSql = "UPDATE users SET Password = ? WHERE UserID = ?";
        $stmt = mysqli_prepare($conn, $updateSql);
        mysqli_stmt_bind_param($stmt, "si", $hashed, $row['UserID']);
        mysqli_stmt_execute($stmt);
    }
}
echo "Passwords successfully hashed.";
?>
