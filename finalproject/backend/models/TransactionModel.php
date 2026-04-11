<?php

// Find SKUID from BaseSKU and string parsed size
function getSKUIDFromFrontendID($conn, $frontendID) {
    $baseSKU = $frontendID;
    $sizeStr = '';

    if (strpos($frontendID, '-small') !== false) {
        $baseSKU = str_replace('-small', '', $frontendID);
        $sizeStr = 'Small';
    } else if (strpos($frontendID, '-medium') !== false) {
        $baseSKU = str_replace('-medium', '', $frontendID);
        $sizeStr = 'Medium';
    } else if (strpos($frontendID, '-large') !== false) {
        $baseSKU = str_replace('-large', '', $frontendID);
        $sizeStr = 'Large';
    }

    if ($sizeStr === '') {
        $sql = "SELECT s.SKUID FROM productskus s 
                INNER JOIN products p ON s.ProductID = p.ProductID 
                WHERE p.BaseSKU = ? AND (s.Size IS NULL OR s.Size = '') LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $baseSKU);
    } else {
        $sql = "SELECT s.SKUID FROM productskus s 
                INNER JOIN products p ON s.ProductID = p.ProductID 
                WHERE p.BaseSKU = ? AND s.Size = ? LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $baseSKU, $sizeStr);
    }

    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);
        if ($row = mysqli_fetch_assoc($result)) {
            return $row['SKUID'];
        }
    }
    return null;
}

// Complete the checkout process
function processCheckout($conn, $userID, $amountPaid, $totalAmountDue, $cartItems, $paymentMethod = 'Cash', $discountAmount = 0) {
    mysqli_begin_transaction($conn);

    try {
        //insert into transactions table
        $sqlTrans = "INSERT INTO transactions (UserID, AmountPaid, TransactionDate, TotalAmountDue, PaymentMethod, DiscountAmount) VALUES (?, ?, NOW(), ?, ?, ?)";
        $stmtTrans = mysqli_prepare($conn, $sqlTrans);
        mysqli_stmt_bind_param($stmtTrans, "iddsd", $userID, $amountPaid, $totalAmountDue, $paymentMethod, $discountAmount);
        
        if (!mysqli_stmt_execute($stmtTrans)) {
            throw new Exception("Failed to insert transaction.");
        }
        
        $transactionID = mysqli_insert_id($conn);
        mysqli_stmt_close($stmtTrans);

        //insert each cart item into transactiondetails and subtract from inventory
        $sqlDetail = "INSERT INTO transactiondetails (TransactionID, SKUID, NumberOfItemSold, PricePerUnit, PriceAmount) VALUES (?, ?, ?, ?, ?)";
        $stmtDetail = mysqli_prepare($conn, $sqlDetail);

        foreach ($cartItems as $item) {
            $skuID = getSKUIDFromFrontendID($conn, $item['id']);
            
            if (!$skuID) {
                throw new Exception("Product ID " . $item['id'] . " not found in database.");
            }

            $qty = intval($item['qty']);
            $pricePerUnit = floatval($item['price']);
            $priceAmount = $qty * $pricePerUnit;

            //insert to transactiondetails
            mysqli_stmt_bind_param($stmtDetail, "iiidd", $transactionID, $skuID, $qty, $pricePerUnit, $priceAmount);
            if (!mysqli_stmt_execute($stmtDetail)) {
                throw new Exception("Failed to insert transaction details for item.");
            }

            //update inventory automatically (checking if row exists first)
            $sqlCheck = "SELECT InventoryID, Quantity FROM inventories WHERE SKUID = ? LIMIT 1";
            $stmtCheck = mysqli_prepare($conn, $sqlCheck);
            mysqli_stmt_bind_param($stmtCheck, "i", $skuID);
            mysqli_stmt_execute($stmtCheck);
            $res = mysqli_stmt_get_result($stmtCheck);
            
            $oldQty = 0;
            if ($invRow = mysqli_fetch_assoc($res)) {
                $oldQty = intval($invRow['Quantity']);
                $newQty = $oldQty - $qty;
                $sqlUp = "UPDATE inventories SET Quantity = ?, LastUpdateTime = NOW() WHERE SKUID = ?";
                $stmtUp = mysqli_prepare($conn, $sqlUp);
                mysqli_stmt_bind_param($stmtUp, "ii", $newQty, $skuID);
                mysqli_stmt_execute($stmtUp);
            } else {
                $newQty = -$qty;
                $sqlIn = "INSERT INTO inventories (SKUID, Quantity, ReorderLevel, LastUpdateTime) VALUES (?, ?, 10, NOW())";
                $stmtIn = mysqli_prepare($conn, $sqlIn);
                mysqli_stmt_bind_param($stmtIn, "ii", $skuID, $newQty);
                mysqli_stmt_execute($stmtIn);
            }

            // Log the deduction in inventory_logs
            $note = "Sale - Transaction #" . $transactionID;
            $sqlLog = "INSERT INTO inventory_logs (SKUID, UserID, ChangeType, QuantityBefore, QuantityChange, QuantityAfter, Note, LogTime)
                       VALUES (?, ?, 'deduction', ?, ?, ?, ?, NOW())";
            $stmtLog = mysqli_prepare($conn, $sqlLog);
            $negQty = -$qty;
            mysqli_stmt_bind_param($stmtLog, "iiiiis", $skuID, $userID, $oldQty, $negQty, $newQty, $note);
            mysqli_stmt_execute($stmtLog);
        }

        mysqli_commit($conn);
        return array("success" => true, "transactionID" => $transactionID);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        return array("success" => false, "message" => $e->getMessage());
    }
}
