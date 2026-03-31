<?php
// backend/controllers/ProductController.php
session_start(); // Important to maintain session security

// Includes (using __DIR__ so paths are always correct regardless of routes.php inclusion)
include_once __DIR__ . '/../config/connect.php';
include_once __DIR__ . '/../models/ProductModel.php';

// Check which function the frontend is asking for
$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------------
// ACTION: Fetch categories and build HTML dropdown options
// -------------------------------------------------------------
if ($action == 'getCategoriesDropdown') {
    $categories = getAllCategories($conn);
    
    // We add a default "Select Category" option at the top
    echo "<option value=''>Select a Category</option>";
    
    foreach ($categories as $cat) {
        // Build an HTML <option> tag for every single category
        echo "<option value='" . $cat['CategoryID'] . "'>" . $cat['CategoryName'] . "</option>";
    }
}

// -------------------------------------------------------------
// ACTION: Fetch products and build HTML table rows
// -------------------------------------------------------------
else if ($action == 'getProductsTable') {
    $products = getAllProducts($conn);
    
    if (empty($products)) {
        // If there are no products, show a friendly message spanning all columns
        echo "<tr><td colspan='7' style='text-align: center;'>No products found.</td></tr>";
    } else {
        foreach ($products as $p) {
            // Build an HTML <tr> (table row) matching the dashboard style perfectly
            echo "<tr>";
            echo "<td>" . $p['ProductName'] . "</td>";
            echo "<td>" . $p['SKUCode'] . "</td>";
            echo "<td><span class='badge'>" . $p['CategoryName'] . "</span></td>";
            
            // Format price to show two decimal places with peso sign
            echo "<td>₱" . number_format($p['Price'], 2) . "</td>";
            
            // Action buttons with your Lucide icons perfectly preserved
            echo "<td>";
            echo "  <button onclick='openUpdateModal(this)' class='edit'><i data-lucide='pencil'></i></button>";
            echo "  <button onclick='openDeleteModal(this)' class='delete'><i data-lucide='trash-2'></i></button>";
            echo "</td>";
            echo "</tr>";
        }
    }
}
?>
