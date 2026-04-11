<?php

session_start();

// Dependencies: Loads the database connection and product catalog functions.
include __DIR__ . '/../config/connect.php';
include __DIR__ . '/../models/ProductModel.php';

// Route Handler: Reads the action param and delegates to the right product operation.
if (isset($_GET['action'])) {
    $action = $_GET['action'];
} else {
    $action = '';
}

if ($action == 'getCategoriesDropdown') {

    $categories = getAllCategories($conn);

    //default placeholder option at the top
    echo "<option value=''>Select a Category</option>";

    //loop through and print one <option> per category row
    foreach ($categories as $cat) {
        echo "<option value='" . $cat['CategoryID'] . "'>" . $cat['CategoryName'] . "</option>";
    }
} else if ($action == 'getProductsTable') {

    $products = getAllProducts($conn);

    if (empty($products)) {
        echo "<tr><td colspan='5' style='text-align:center;'>No products found.</td></tr>";
    } else {
        foreach ($products as $p) {
            //store skuid, productid, and categoryid as data attributes so the JS
            //can pass them back to the backend when the user clicks Edit or Delete
            echo "<tr data-skuid='" . $p['SKUID'] . "' data-productid='" . $p['ProductID'] . "' data-categoryid='" . $p['CategoryID'] . "'>";

            if (!empty($p['Size'])) {
                echo "  <td>" . $p['ProductName'] . " (" . $p['Size'] . ")</td>";
            } else {
                echo "  <td>" . $p['ProductName'] . "</td>";
            }

            echo "  <td>" . $p['SKUCode'] . "</td>";
            echo "  <td><span class='badge'>" . $p['CategoryName'] . "</span></td>";
            echo "  <td>₱" . number_format($p['Price'], 2) . "</td>";
            echo "  <td>";
            echo "    <button onclick='openUpdateModal(this)' class='edit'><i data-lucide='pencil'></i></button>";
            echo "    <button onclick='openDeleteModal(this)' class='delete'><i data-lucide='trash-2'></i></button>";
            echo "  </td>";
            echo "</tr>";
        }
    }
} else if ($action == 'addProduct') {

    $type = $_POST['type'];  // "Food" or "Drink"
    $name = trim($_POST['name']);

    //assign category ID
    if ($_POST['type'] == 'Drink') {
        $categoryID = 1;
    } else {
        $categoryID = 2;
    }

    //generate base SKU
    //find the position of the first space
    $space = strpos($name, ' ');

    if ($space !== false) {
        //pag may space get the 1st letter ($name[0]) + the letter right after the space
        $baseSKU = strtoupper($name[0] . $name[$space + 1]) . '00';
    } else {
        //pag walang space get 1,2 character
        $baseSKU = strtoupper($name[0] . $name[1]) . '00';
    }

    //add random numbers at the end to prevent duplicate SKUs
    $baseSKU = $baseSKU . rand(10, 99);


    //handle the image upload 
    $imagePath = '';

    //only run this block if the user selected a photo
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {

        //reject anything over 2MB (2,097,152 bytes)
        $maxSizeInBytes = 2 * 1024 * 1024;

        if ($_FILES['image']['size'] > $maxSizeInBytes) {
            echo "ErrorImageTooLarge";
            exit;
        }

        //get the file extension (jpg, png, etc.)
        $originalName = $_FILES['image']['name'];
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        //make sure only safe image types are accepted
        $allowedTypes = array('jpg', 'jpeg', 'png', 'gif', 'webp');

        if (in_array($ext, $allowedTypes)) {

            //build the destination path to the uploadLogo folder
            $uploadFolder = __DIR__ . '/../../database/uploadLogo/';

            //create a unique filename so two products never overwrite each other
            $newFilename = 'product_' . time() . '_' . rand(1000, 9999) . '.' . $ext;

            //actually move the file from the PHP temp folder to our uploadLogo folder
            $moveSuccess = move_uploaded_file($_FILES['image']['tmp_name'], $uploadFolder . $newFilename);

            if ($moveSuccess) {
                //save the relative path. This is what gets stored in the database.
                $imagePath = 'database/uploadLogo/' . $newFilename;
            }
        }
    }


    //bBuild the list of size variations to insert
    $variations = array();

    if ($type == 'Food') {

        //food products only have one variation (no size)
        $variation = array();
        $variation['skuCode'] = $baseSKU . 'S';
        $variation['size'] = NULL;
        $variation['price'] = floatval($_POST['price']);
        $variation['imagePath'] = $imagePath;

        $variations[] = $variation;

    } else if ($type == 'Drink') {

        //drink products have 3 sizes: Small, Medium, Large
        //all three share the same uploaded image

        $small = array();
        $small['skuCode'] = $baseSKU . 'S';
        $small['size'] = 'Small';
        $small['price'] = floatval($_POST['smallPrice']);
        $small['imagePath'] = $imagePath;

        $medium = array();
        $medium['skuCode'] = $baseSKU . 'M';
        $medium['size'] = 'Medium';
        $medium['price'] = floatval($_POST['mediumPrice']);
        $medium['imagePath'] = $imagePath;

        $large = array();
        $large['skuCode'] = $baseSKU . 'L';
        $large['size'] = 'Large';
        $large['price'] = floatval($_POST['largePrice']);
        $large['imagePath'] = $imagePath;

        $variations[] = $small;
        $variations[] = $medium;
        $variations[] = $large;
    }


    //send everything to the model to save in the database
    $success = addProductFull($conn, $categoryID, $name, $baseSKU, $variations);

    if ($success) {
        echo "Success";
    } else {
        echo "Failed";
    }
} else if ($action == 'updateProduct') {

    $skuID = intval($_POST['skuID']);
    $productID = intval($_POST['productID']);
    $name = trim($_POST['name']);
    $skuCode = trim($_POST['skuCode']);
    $price = floatval($_POST['price']);
    $categoryID = intval($_POST['categoryID']);

    $success = updateProductSKU($conn, $skuID, $productID, $name, $skuCode, $price, $categoryID);

    if ($success) {
        echo "Success";
    } else {
        echo "Failed: " . mysqli_error($conn);
    }
} else if ($action == 'deleteProduct') {

    $skuID = intval($_POST['skuID']);

    $result = deleteProductSKU($conn, $skuID);

    if ($result === "ErrorStockExists") {
        echo "Error: Cannot delete product while stock exists. Please clear inventory first.";
    } else if ($result === true) {
        echo "Success";
    } else {
        echo "Failed: " . mysqli_error($conn);
    }
} else if ($action == 'getPOSProductsJSON') {
    //return a JSON list of products and their size variations for the POS frontend
    $data = getPOSProductsDataFull($conn);
    $posProductsMap = array();

    if (!empty($data)) {
        foreach ($data as $p) {
            $baseSKU = $p['BaseSKU'];
            $stock = intval($p['Quantity']);
            
            if (!isset($posProductsMap[$baseSKU])) {
                $posProductsMap[$baseSKU] = array(
                    "id" => $baseSKU,
                    "name" => $p['ProductName'],
                    "price" => floatval($p['Price']),
                    "stock" => 0, // start at 0, sum stock across variations
                    "category" => strtolower($p['CategoryName']),
                    "img" => !empty($p['ProductImagePath']) ? '../../' . $p['ProductImagePath'] : "",
                    "variations" => array(),
                    "variationStocks" => array()
                );
            }
            
            // Add to total stock
            $posProductsMap[$baseSKU]['stock'] += $stock;
            
            // if size exists and not empty, load variations
            if (!empty($p['Size'])) {
                $sizeKey = strtolower($p['Size']);
                $posProductsMap[$baseSKU]['variations'][$sizeKey] = floatval($p['Price']);
                $posProductsMap[$baseSKU]['variationStocks'][$sizeKey] = $stock;
            }
        }
    }

    $posProducts = array_values($posProductsMap);

    header('Content-Type: application/json');
    echo json_encode($posProducts);
}