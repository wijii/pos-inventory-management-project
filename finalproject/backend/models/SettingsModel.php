<?php

function initSettingsTable($conn)
{
    $sql = "CREATE TABLE IF NOT EXISTS system_settings (
        SettingKey VARCHAR(50) PRIMARY KEY,
        SettingValue VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    mysqli_query($conn, $sql);

    // Insert default values if not exists
    $defaults = [
        'storeName' => 'Casa Cafe',
        'storeEmail' => 'casacafe@gmail.com',
        'contactNumber' => '09999292751',
        'taxRate' => '5',
        'stockAlert' => '5'
    ];

    foreach ($defaults as $key => $val) {
        $check = mysqli_query($conn, "SELECT SettingKey FROM system_settings WHERE SettingKey = '$key'");
        if (mysqli_num_rows($check) == 0) {
            $stmt = mysqli_prepare($conn, "INSERT INTO system_settings (SettingKey, SettingValue) VALUES (?, ?)");
            mysqli_stmt_bind_param($stmt, "ss", $key, $val);
            mysqli_stmt_execute($stmt);
        }
    }
}

function getUserProfile($conn, $userId)
{
    $sql = "SELECT FirstName, LastName, Username, EmailAddress FROM users WHERE UserID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $userId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    if ($row = mysqli_fetch_assoc($result)) {
        return $row;
    }
    return null;
}

function saveUserProfile($conn, $userId, $firstName, $lastName, $username, $email, $password)
{
    if (!empty($password)) {
        // Hash the new password if provided
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $sql = "UPDATE users SET FirstName=?, LastName=?, Username=?, EmailAddress=?, Password=? WHERE UserID=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssssi", $firstName, $lastName, $username, $email, $hashed, $userId);
    } else {
        $sql = "UPDATE users SET FirstName=?, LastName=?, Username=?, EmailAddress=? WHERE UserID=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssi", $firstName, $lastName, $username, $email, $userId);
    }

    return mysqli_stmt_execute($stmt);
}

function getSystemSettings($conn)
{
    // Make sure table exists
    initSettingsTable($conn);

    $sql = "SELECT SettingKey, SettingValue FROM system_settings";
    $result = mysqli_query($conn, $sql);
    $settings = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $settings[$row['SettingKey']] = $row['SettingValue'];
    }
    return $settings;
}

function saveSystemSettings($conn, $settingsArray)
{
    initSettingsTable($conn);

    $sql = "UPDATE system_settings SET SettingValue = ? WHERE SettingKey = ?";
    $stmt = mysqli_prepare($conn, $sql);

    foreach ($settingsArray as $key => $value) {
        mysqli_stmt_bind_param($stmt, "ss", $value, $key);
        mysqli_stmt_execute($stmt);
    }
    return true;
}
