<?php

function getFullInventory($conn)
{
    //select from inventories and join with productskus and products
    $sql = "SELECT p.ProductName as Name, s.SKUCode, s.Size, 
                   IFNULL(i.Quantity, 0) as Quantity, 
                   IFNULL(i.ReorderLevel, 5) as ReorderLevel, 
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

function updateInventoryStock($conn, $skuCode, $newStock, $userID)
{
    // Get SKUID from the given SKUCode
    $sql = "SELECT s.SKUID, IFNULL(i.Quantity, 0) as CurrentQty
            FROM productskus s
            LEFT JOIN inventories i ON s.SKUID = i.SKUID
            WHERE s.SKUCode = ? LIMIT 1";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $skuCode);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($res);

    if (!$row)
        return false;

    $skuID = intval($row['SKUID']);
    $oldQty = intval($row['CurrentQty']);
    $delta = $newStock - $oldQty;
    $changeType = $delta >= 0 ? 'restock' : 'adjustment';

    // Update or insert stock
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
    if (!mysqli_stmt_execute($stmtAction))
        return false;

    // Write audit log only if there was a change
    if ($delta !== 0) {
        $note = $changeType === 'restock' ? 'Manual stock update' : 'Manual adjustment';
        $sqlLog = "INSERT INTO inventory_logs (SKUID, UserID, ChangeType, QuantityBefore, QuantityChange, QuantityAfter, Note, LogTime)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmtLog = mysqli_prepare($conn, $sqlLog);
        mysqli_stmt_bind_param($stmtLog, "iisiiis", $skuID, $userID, $changeType, $oldQty, $delta, $newStock, $note);
        mysqli_stmt_execute($stmtLog);
    }

    return true;
}



//adds a quantity delta to an item's stock and logs the change
//used by the "Add Stock" restock action on the inventory page
function restockInventory($conn, $skuCode, $addQty, $userID, $note)
{
    //find the SKUID
    $stmt = mysqli_prepare($conn, "SELECT SKUID FROM productskus WHERE SKUCode = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "s", $skuCode);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($res);
    if (!$row)
        return false;
    $skuID = intval($row['SKUID']);

    //get current stock
    $stmt2 = mysqli_prepare($conn, "SELECT Quantity FROM inventories WHERE SKUID = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt2, "i", $skuID);
    mysqli_stmt_execute($stmt2);
    $res2 = mysqli_stmt_get_result($stmt2);
    $row2 = mysqli_fetch_assoc($res2);
    $currentQty = $row2 ? intval($row2['Quantity']) : 0;

    $newQty = $currentQty + $addQty;

    //update or insert into inventories
    if ($row2) {
        $sqlUpd = "UPDATE inventories SET Quantity = ?, LastUpdateTime = NOW() WHERE SKUID = ?";
        $stmtUpd = mysqli_prepare($conn, $sqlUpd);
        mysqli_stmt_bind_param($stmtUpd, "ii", $newQty, $skuID);
        mysqli_stmt_execute($stmtUpd);
    } else {
        $sqlIns = "INSERT INTO inventories (Quantity, SKUID, LastUpdateTime) VALUES (?, ?, NOW())";
        $stmtIns = mysqli_prepare($conn, $sqlIns);
        mysqli_stmt_bind_param($stmtIns, "ii", $newQty, $skuID);
        mysqli_stmt_execute($stmtIns);
    }

    //write audit log row
    $sqlLog = "INSERT INTO inventory_logs (SKUID, UserID, ChangeType, QuantityBefore, QuantityChange, QuantityAfter, Note, LogTime)
               VALUES (?, ?, 'restock', ?, ?, ?, ?, NOW())";
    $stmtLog = mysqli_prepare($conn, $sqlLog);
    mysqli_stmt_bind_param($stmtLog, "iiiiis", $skuID, $userID, $currentQty, $addQty, $newQty, $note);
    mysqli_stmt_execute($stmtLog);

    return $newQty;
}


//returns the full audit trail from inventory_logs, newest first
function getInventoryLogs($conn, $search = '', $dateFrom = '', $dateTo = '')
{
    $whereClauses = [];
    $params = [];
    $types = '';

    if (!empty($search)) {
        $whereClauses[] = "(s.SKUCode LIKE ? OR p.ProductName LIKE ?)";
        $searchParam = "%" . $search . "%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= 'ss';
    }

    if (!empty($dateFrom)) {
        // filter from start of day
        $whereClauses[] = "l.LogTime >= ?";
        $params[] = $dateFrom . " 00:00:00";
        $types .= 's';
    }

    if (!empty($dateTo)) {
        // filter to end of day
        $whereClauses[] = "l.LogTime <= ?";
        $params[] = $dateTo . " 23:59:59";
        $types .= 's';
    }

    $whereSql = '';
    if (count($whereClauses) > 0) {
        $whereSql = "WHERE " . implode(" AND ", $whereClauses);
    }

    $sql = "SELECT
                l.LogID,
                l.ChangeType,
                l.QuantityBefore,
                l.QuantityChange,
                l.QuantityAfter,
                l.Note,
                l.LogTime,
                CONCAT(p.ProductName, IF(s.Size != '', CONCAT(' (', s.Size, ')'), '')) AS itemName,
                s.SKUCode,
                IFNULL(CONCAT(u.FirstName, ' ', u.LastName), 'System') AS changedBy
            FROM inventory_logs l
            INNER JOIN productskus s ON l.SKUID    = s.SKUID
            INNER JOIN products    p ON s.ProductID = p.ProductID
            LEFT  JOIN users       u ON l.UserID    = u.UserID
            $whereSql
            ORDER BY l.LogTime DESC
            LIMIT 200";

    $stmt = mysqli_prepare($conn, $sql);
    
    if (count($params) > 0) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }

    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $logs = array();

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $logs[] = array(
                'logID' => intval($row['LogID']),
                'changeType' => $row['ChangeType'],
                'quantityBefore' => intval($row['QuantityBefore']),
                'quantityChange' => intval($row['QuantityChange']),
                'quantityAfter' => intval($row['QuantityAfter']),
                'note' => $row['Note'],
                'logTime' => $row['LogTime'],
                'itemName' => $row['itemName'],
                'skuCode' => $row['SKUCode'],
                'changedBy' => $row['changedBy'],
            );
        }
    }

    return $logs;
}

