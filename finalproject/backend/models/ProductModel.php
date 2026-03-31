<?php
// backend/models/ProductModel.php

// Connects to the database and retrieves all categories
function getAllCategories($conn)
{
    $sql = "SELECT CategoryID, CategoryName FROM categories";

    $result = mysqli_query($conn, $sql);

    $categories = array();

    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            $categories[] = $row;
        }
    }

    return $categories;
}

// Retrieves all distinct products and their variations (SKUs)
function getAllProducts($conn)
{
    // We join products, categories, and productskus to get full detail
    $sql = "SELECT p.ProductID, p.ProductName, p.BaseSKU, c.CategoryName,
                   s.SKUID, s.SKUCode, s.Size, s.Price, s.ProductImagePath, s.AvailabilityStatus
            FROM products p
            INNER JOIN categories c ON p.CategoryID = c.CategoryID
            INNER JOIN productskus s ON p.ProductID = s.ProductID
            WHERE s.AvailabilityStatus = 'Available'";

    $result = mysqli_query($conn, $sql);

    $products = array();

    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            $products[] = $row;
        }
    }

    return $products;
}

// Example function showing how to add a product using prepared statements
function addProduct($conn, $categoryID, $productName, $baseSKU)
{
    $sql = "INSERT INTO products (CategoryID, ProductName, BaseSKU) VALUES (?, ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);

    if ($stmt) {
        // 'iss' means integer, string, string
        mysqli_stmt_bind_param($stmt, "iss", $categoryID, $productName, $baseSKU);

        if (mysqli_stmt_execute($stmt)) {
            return array("status" => true, "product_id" => mysqli_insert_id($conn));
        }
    }

    return array("status" => false, "message" => "Failed to add product.");
}
?>