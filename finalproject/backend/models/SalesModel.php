<?php

//returns overall lifetime stats: total revenue, total transactions, avg ticket
function getSalesLifetimeStats($conn) {
    $sql = "SELECT
                IFNULL(SUM(TotalAmountDue), 0) AS totalRevenue,
                COUNT(TransactionID)            AS totalTransactions,
                IFNULL(AVG(TotalAmountDue), 0)  AS avgTicket
            FROM transactions";

    $result = mysqli_query($conn, $sql);
    $row    = mysqli_fetch_assoc($result);

    return array(
        'totalRevenue'      => floatval($row['totalRevenue']),
        'totalTransactions' => intval($row['totalTransactions']),
        'avgTicket'         => floatval($row['avgTicket']),
    );
}


//returns revenue + transaction count per point for the selected period
//daily   -> last 14 days, one row per day
//weekly  -> last 12 weeks, one row per week
//monthly -> last 12 months, one row per month
function getSalesChartData($conn, $period) {

    if ($period === 'daily') {

        $sql = "SELECT
                    DATE_FORMAT(TransactionDate, '%b %d') AS label,
                    IFNULL(SUM(TotalAmountDue), 0)        AS revenue,
                    COUNT(TransactionID)                   AS transCount
                FROM transactions
                WHERE TransactionDate >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
                GROUP BY DATE(TransactionDate)
                ORDER BY DATE(TransactionDate) ASC";

    } else if ($period === 'weekly') {

        $sql = "SELECT
                    CONCAT('Wk ', LPAD(WEEK(TransactionDate, 3), 2, '0')) AS label,
                    IFNULL(SUM(TotalAmountDue), 0)                         AS revenue,
                    COUNT(TransactionID)                                    AS transCount
                FROM transactions
                WHERE TransactionDate >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
                GROUP BY YEARWEEK(TransactionDate, 3)
                ORDER BY YEARWEEK(TransactionDate, 3) ASC";

    } else {

        //monthly: last 12 months
        $sql = "SELECT
                    DATE_FORMAT(TransactionDate, '%b %Y') AS label,
                    IFNULL(SUM(TotalAmountDue), 0)        AS revenue,
                    COUNT(TransactionID)                   AS transCount
                FROM transactions
                WHERE TransactionDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(TransactionDate, '%Y-%m')
                ORDER BY DATE_FORMAT(TransactionDate, '%Y-%m') ASC";
    }

    $result = mysqli_query($conn, $sql);

    $labels      = array();
    $revenue     = array();
    $transCount  = array();

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $labels[]     = $row['label'];
            $revenue[]    = floatval($row['revenue']);
            $transCount[] = intval($row['transCount']);
        }
    }

    return array(
        'labels'       => $labels,
        'revenue'      => $revenue,
        'transactions' => $transCount,
    );
}


//returns all products ranked by units sold and revenue (all-time)
function getSalesProductBreakdown($conn) {

    $sql = "SELECT
                p.ProductName                    AS name,
                SUM(td.NumberOfItemSold)         AS sold,
                SUM(td.PriceAmount)              AS revenue
            FROM transactiondetails td
            INNER JOIN productskus s ON td.SKUID      = s.SKUID
            INNER JOIN products    p ON s.ProductID   = p.ProductID
            GROUP BY p.ProductID, p.ProductName
            ORDER BY revenue DESC";

    $result   = mysqli_query($conn, $sql);
    $products = array();

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $products[] = array(
                'name'    => $row['name'],
                'sold'    => intval($row['sold']),
                'revenue' => floatval($row['revenue']),
            );
        }
    }

    return $products;
}


//returns the transaction list (most recent first), with item count and cashier name
function getSalesTransactionHistory($conn) {

    $sql = "SELECT
                t.TransactionID,
                t.TotalAmountDue,
                t.AmountPaid,
                t.TransactionDate,
                CONCAT(u.FirstName, ' ', u.LastName) AS cashierName,
                COUNT(td.TransactionDetailID)         AS itemCount
            FROM transactions t
            LEFT JOIN users u              ON t.UserID         = u.UserID
            LEFT JOIN transactiondetails td ON t.TransactionID = td.TransactionID
            GROUP BY t.TransactionID
            ORDER BY t.TransactionDate DESC";

    $result      = mysqli_query($conn, $sql);
    $history     = array();

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $history[] = array(
                'transactionID' => intval($row['TransactionID']),
                'total'         => floatval($row['TotalAmountDue']),
                'amountPaid'    => floatval($row['AmountPaid']),
                'date'          => date('M d, Y', strtotime($row['TransactionDate'])),
                'time'          => date('h:i A',  strtotime($row['TransactionDate'])),
                'cashier'       => $row['cashierName'] ? $row['cashierName'] : 'Admin',
                'itemCount'     => intval($row['itemCount']),
            );
        }
    }

    return $history;
}


//returns the individual items for a single transaction (for the receipt modal)
function getSalesReceiptItems($conn, $transactionID) {

    $sql = "SELECT
                p.ProductName       AS name,
                s.Size              AS size,
                td.NumberOfItemSold AS qty,
                td.PricePerUnit     AS price,
                td.PriceAmount      AS subtotal
            FROM transactiondetails td
            INNER JOIN productskus s ON td.SKUID    = s.SKUID
            INNER JOIN products    p ON s.ProductID = p.ProductID
            WHERE td.TransactionID = ?
            ORDER BY td.TransactionDetailID ASC";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $transactionID);
    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);
    $items  = array();

    while ($row = mysqli_fetch_assoc($result)) {
        $displayName = $row['name'];
        if (!empty($row['size'])) {
            $displayName .= ' (' . $row['size'] . ')';
        }

        $items[] = array(
            'name'     => $displayName,
            'qty'      => intval($row['qty']),
            'price'    => floatval($row['price']),
            'subtotal' => floatval($row['subtotal']),
        );
    }

    mysqli_stmt_close($stmt);
    return $items;
}
