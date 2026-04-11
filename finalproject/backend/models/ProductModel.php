<?php
// Gets all categories from the database
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


// Gets all products along with their SKU variations and category
function getAllProducts($conn)
{
    //join products, categories, and productskus to get full detail
    //CategoryID is included so the frontend can pre-select it in the update dropdown
    $sql = "SELECT p.ProductID, p.ProductName, p.BaseSKU, c.CategoryID, c.CategoryName,
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

//gets all base products + size variations for the POS screen with quantities mapped
function getPOSProductsDataFull($conn)
{
    $sql = "SELECT p.ProductID, p.ProductName, p.BaseSKU, c.CategoryName,
                   s.SKUID, s.SKUCode, s.Size, s.Price, s.ProductImagePath,
                   IFNULL(i.Quantity, 0) as Quantity
            FROM products p
            INNER JOIN categories c ON p.CategoryID = c.CategoryID
            INNER JOIN productskus s ON p.ProductID = s.ProductID
            LEFT JOIN inventories i ON s.SKUID = i.SKUID
            WHERE s.AvailabilityStatus = 'Available'
            ORDER BY p.ProductID ASC, FIELD(IFNULL(s.Size, ''), '', 'Small', 'Medium', 'Large')";

    $result = mysqli_query($conn, $sql);
    $products = array();

    if ($result && mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            $products[] = $row;
        }
    }

    return $products;
}


//nserts a new product and all its size variations into the database
function addProductFull($conn, $categoryID, $productName, $baseSKU, $variations)
{
    //insert the base product first
    $sql = "INSERT INTO products (CategoryID, ProductName, BaseSKU) VALUES (?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);

    if (!$stmt) {
        return false;
    }

    mysqli_stmt_bind_param($stmt, "iss", $categoryID, $productName, $baseSKU);

    $success = mysqli_stmt_execute($stmt);

    if (!$success) {
        mysqli_stmt_close($stmt);
        return false;
    }

    //get the ID of the product we just inserted
    $productID = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);


    //insert each size variation (SKU) for that product
    $sqlSKU = "INSERT INTO productskus (ProductID, SKUCode, Size, Price, ProductImagePath, AvailabilityStatus)
               VALUES (?, ?, ?, ?, ?, 'Available')";

    $stmtSKU = mysqli_prepare($conn, $sqlSKU);

    if (!$stmtSKU) {
        return false;
    }

    foreach ($variations as $var) {

        $skuCode = $var['skuCode'];
        $size = $var['size'];
        $price = $var['price'];

        //use the image path if it was provided, otherwise use empty string
        if (isset($var['imagePath'])) {
            $imagePath = $var['imagePath'];
        } else {
            $imagePath = '';
        }

        // i = integer, s = string, s = string, d = decimal, s = string
        mysqli_stmt_bind_param($stmtSKU, "issds", $productID, $skuCode, $size, $price, $imagePath);
        mysqli_stmt_execute($stmtSKU);
    }

    mysqli_stmt_close($stmtSKU);

    return true;
}


//updates the product name + category in products table, and the SKU code + price in productskus
function updateProductSKU($conn, $skuID, $productID, $name, $skuCode, $price, $categoryID)
{
    //update the product name and category in the products table
    $sql1 = "UPDATE products SET ProductName = ?, CategoryID = ? WHERE ProductID = ?";
    $stmt1 = mysqli_prepare($conn, $sql1);
    if (!$stmt1)
        return false;

    //s = string (name), i = integer (categoryID), i = integer (productID)
    mysqli_stmt_bind_param($stmt1, "sii", $name, $categoryID, $productID);
    $ok1 = mysqli_stmt_execute($stmt1);
    mysqli_stmt_close($stmt1);

    if (!$ok1)
        return false;

    //update the sku code and price in the productskus table
    $sql2 = "UPDATE productskus SET SKUCode = ?, Price = ? WHERE SKUID = ?";
    $stmt2 = mysqli_prepare($conn, $sql2);
    if (!$stmt2)
        return false;

    //s = string (skuCode), d = decimal (price), i = integer (skuID)
    mysqli_stmt_bind_param($stmt2, "sdi", $skuCode, $price, $skuID);
    $ok2 = mysqli_stmt_execute($stmt2);
    mysqli_stmt_close($stmt2);

    return $ok2;
}


//soft-deletes a SKU by marking it Unavailable instead of removing the row from the database This keeps the sales history intact if it was ever sold
function deleteProductSKU($conn, $skuID)
{
    // 1. Check if there is remaining stock in the inventories table
    $sqlCheck = "SELECT Quantity FROM inventories WHERE SKUID = ? LIMIT 1";
    $stmtCheck = mysqli_prepare($conn, $sqlCheck);
    mysqli_stmt_bind_param($stmtCheck, "i", $skuID);
    mysqli_stmt_execute($stmtCheck);
    $resCheck = mysqli_stmt_get_result($stmtCheck);
    $inv = mysqli_fetch_assoc($resCheck);

    $stock = $inv ? intval($inv['Quantity']) : 0;

    if ($stock > 0) {
        // Cannot delete if there is still stock
        return "ErrorStockExists";
    }

    // 2. Perform soft-delete (mark as Unavailable)
    $sql = "UPDATE productskus SET AvailabilityStatus = 'Unavailable' WHERE SKUID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt)
        return false;

    mysqli_stmt_bind_param($stmt, "i", $skuID);
    $success = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    return $success;
}