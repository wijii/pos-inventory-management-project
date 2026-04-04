<?php
session_start();
$_SESSION['user_id'] = 1;
include __DIR__ . '/connect.php';
include __DIR__ . '/../models/InventoryModel.php';
$data = getFullInventory($conn);
echo json_encode($data);
