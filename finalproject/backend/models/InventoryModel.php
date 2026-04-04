<?php

function getFullInventory($conn)
{
    //select from inventories and join with productskus and products
    $sql = "SELECT p.ProductName as Name, s.SKUCode, s.Size, 
                   IFNULL(i.Quantity, 0) as Quantity, 
                   IFNULL(i.ReorderLevel, 10) as ReorderLevel, 
                   UNIX_TIMESTAMP(i.LastUpdateTime) as LastUpdateTimeTs 
            FROM productskus s
            INNER JOIN products p ON s.ProductID = p.ProductID
            LEFT JOIN inventories i ON s.SKUID = i.SKUID
            WHERE s.AvailabilityStatus = 'Available'
            ORDER BY Quantity ASC";
    $result = mysqli_query($conn, $sql);

    $inventory = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $name = $row['Name'];
            if (!empty($row['Size'])) {
                $name .= ' (' . $row['Size'] . ')';
            }

            // convert completely timezone-safe UNIX timestamp to milliseconds for javascript compatibility
            $lastUpdatedMs = $row['LastUpdateTimeTs'] ? intval($row['LastUpdateTimeTs']) * 1000 : time() * 1000;

            $inventory[] = array(
                'id' => $row['SKUCode'],
                'name' => $name,
                'stock' => intval($row['Quantity']),
                'threshold' => intval($row['ReorderLevel']),
                'lastUpdated' => $lastUpdatedMs
            );
        }
    }
    return $inventory;
}

function updateInventoryStock($conn, $skuCode, $newStock)
{
    // Get SKUID from the given SKUCode
    $sql = "SELECT SKUID FROM productskus WHERE SKUCode = ? LIMIT 1";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $skuCode);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    if ($row = mysqli_fetch_assoc($res)) {
        $skuID = $row['SKUID'];

        $sqlCheck = "SELECT InventoryID FROM inventories WHERE SKUID = ?";
        $stmtCheck = mysqli_prepare($conn, $sqlCheck);
        mysqli_stmt_bind_param($stmtCheck, "i", $skuID);
        mysqli_stmt_execute($stmtCheck);
        $resCheck = mysqli_stmt_get_result($stmtCheck);
        
        if (mysqli_fetch_assoc($resCheck)) {
            $sqlAction = "UPDATE inventories SET Quantity = ?, LastUpdateTime = NOW() WHERE SKUID = ?";
        } else {
            $sqlAction = "INSERT INTO inventories (Quantity, SKUID, LastUpdateTime) VALUES (?, ?, NOW())";
        }
        
        $stmtAction = mysqli_prepare($conn, $sqlAction);
        mysqli_stmt_bind_param($stmtAction, "ii", $newStock, $skuID);
        if (mysqli_stmt_execute($stmtAction)) {
            return true;
        }
    }
    return false;
}
