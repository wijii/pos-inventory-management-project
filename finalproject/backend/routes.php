<?php


//AJAX requests will be sent to this file.
//check what action the frontend wants to perform.
$action = isset($_GET['action']) ? $_GET['action'] : '';

//route the request to the controller based on the action
switch ($action) {
    case 'login':
        require 'controllers/AuthController.php';
        break;

    //prod actions
    case 'getCategoriesDropdown':
    case 'getProductsTable':
        // case 'addProduct': mamya na ulit auko na
        require 'controllers/ProductController.php';
        break;

    default:
        echo "Error: The requested action was not found.";
        break;
}
?>