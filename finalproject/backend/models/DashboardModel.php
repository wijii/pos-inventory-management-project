<?php

//returns total sales revenue, transaction count, and average for the given period.
//period valuesdaily, weekly, monthly
function getDashboardSummary($conn, $period)
{

    if ($period === 'daily') {
        $dateFilter = "DATE(t.TransactionDate) = CURDATE()";
    } else if ($period === 'weekly') {
        $dateFilter = "YEARWEEK(t.TransactionDate, 1) = YEARWEEK(CURDATE(), 1)";
    } else {
        // monthly
        $dateFilter = "YEAR(t.TransactionDate) = YEAR(CURDATE()) AND MONTH(t.TransactionDate) = MONTH(CURDATE())";
    }

    $sql = "SELECT
                IFNULL(SUM(t.TotalAmountDue), 0) AS totalSales,
                COUNT(t.TransactionID)            AS totalTransactions,
                IFNULL(AVG(t.TotalAmountDue), 0)  AS avgTransaction
            FROM transactions t
            WHERE $dateFilter";

    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);

    return array(
        'totalSales' => floatval($row['totalSales']),
        'totalTransactions' => intval($row['totalTransactions']),
        'avgTransaction' => floatval($row['avgTransaction']),
    );
}


//returns count of products whose inventory quantity is at or below the reorder level.
function getLowStockCount($conn)
{

    $sql = "SELECT COUNT(*) AS lowCount
            FROM inventories i
            JOIN productskus ps ON i.SKUID = ps.SKUID
            WHERE ps.AvailabilityStatus != 'Unavailable' 
              AND (i.Quantity < IF(i.ReorderLevel > 0, i.ReorderLevel, 5) OR i.Quantity = 0)";

    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);

    return intval($row['lowCount']);
}


//returns chart data (labels + revenue values) grouped by the period.
//daily grouped by hour (8am–10pm)
//weekly grouped by day of week (Mon–Sun)
//monthly grouped by week of month (Wk 1–4)
function getDashboardChartData($conn, $period)
{

    if ($period === 'daily') {

        // for today group by hour and show 8am to 10pm slots
        $sql = "SELECT
                    HOUR(t.TransactionDate)          AS slot,
                    IFNULL(SUM(t.TotalAmountDue), 0) AS revenue
                FROM transactions t
                WHERE DATE(t.TransactionDate) = CURDATE()
                GROUP BY HOUR(t.TransactionDate)
                ORDER BY slot";

        $result = mysqli_query($conn, $sql);

        // build a map of hour revenue so we can fill in zeros for empty hours
        $hourMap = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $hourMap[intval($row['slot'])] = floatval($row['revenue']);
        }

        // show business hours 8am to 10pm
        $labels = array();
        $values = array();
        for ($h = 8; $h <= 22; $h += 2) {
            $labels[] = ($h < 12 ? $h . ':00 AM' : ($h == 12 ? '12:00 PM' : ($h - 12) . ':00 PM'));
            $values[] = isset($hourMap[$h]) ? $hourMap[$h] : 0;
        }

        return array('labels' => $labels, 'values' => $values);

    } else if ($period === 'weekly') {

        // for this week group by day name
        $sql = "SELECT
                    DAYOFWEEK(t.TransactionDate)     AS dayNum,
                    DAYNAME(t.TransactionDate)        AS dayName,
                    IFNULL(SUM(t.TotalAmountDue), 0) AS revenue
                FROM transactions t
                WHERE YEARWEEK(t.TransactionDate, 1) = YEARWEEK(CURDATE(), 1)
                GROUP BY dayNum, dayName
                ORDER BY dayNum";

        $result = mysqli_query($conn, $sql);

        // build a map by day number (1=Sun)
        $dayMap = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $dayMap[intval($row['dayNum'])] = floatval($row['revenue']);
        }

        // Mon=2, Tue=3, Wed=4, Thu=5, Fri=6, Sat=7, Sun=1
        $dayOrder = array(2 => 'Mon', 3 => 'Tue', 4 => 'Wed', 5 => 'Thu', 6 => 'Fri', 7 => 'Sat', 1 => 'Sun');
        $labels = array();
        $values = array();
        foreach ($dayOrder as $num => $label) {
            $labels[] = $label;
            $values[] = isset($dayMap[$num]) ? $dayMap[$num] : 0;
        }

        return array('labels' => $labels, 'values' => $values);

    } else {

        // monthlygroup by week of the month (1–4)
        $sql = "SELECT
                    CEIL(DAY(t.TransactionDate) / 7) AS weekNum,
                    IFNULL(SUM(t.TotalAmountDue), 0) AS revenue
                FROM transactions t
                WHERE YEAR(t.TransactionDate)  = YEAR(CURDATE())
                  AND MONTH(t.TransactionDate) = MONTH(CURDATE())
                GROUP BY weekNum
                ORDER BY weekNum";

        $result = mysqli_query($conn, $sql);

        $weekMap = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $weekMap[intval($row['weekNum'])] = floatval($row['revenue']);
        }

        $labels = array('Wk 1', 'Wk 2', 'Wk 3', 'Wk 4');
        $values = array();
        for ($w = 1; $w <= 4; $w++) {
            $values[] = isset($weekMap[$w]) ? $weekMap[$w] : 0;
        }

        return array('labels' => $labels, 'values' => $values);
    }
}


//returns the top 5 best-selling products (by revenue) for the given period.
function getDashboardTopProducts($conn, $period)
{

    if ($period === 'daily') {
        $dateFilter = "DATE(t.TransactionDate) = CURDATE()";
    } else if ($period === 'weekly') {
        $dateFilter = "YEARWEEK(t.TransactionDate, 1) = YEARWEEK(CURDATE(), 1)";
    } else {
        $dateFilter = "YEAR(t.TransactionDate) = YEAR(CURDATE()) AND MONTH(t.TransactionDate) = MONTH(CURDATE())";
    }

    $sql = "SELECT
                p.ProductName                       AS name,
                SUM(td.NumberOfItemSold)            AS sold,
                SUM(td.PriceAmount)                 AS amount
            FROM transactiondetails td
            INNER JOIN transactions t   ON td.TransactionID = t.TransactionID
            INNER JOIN productskus  s   ON td.SKUID         = s.SKUID
            INNER JOIN products     p   ON s.ProductID      = p.ProductID
            WHERE $dateFilter
            GROUP BY p.ProductID, p.ProductName
            ORDER BY amount DESC
            LIMIT 5";

    $result = mysqli_query($conn, $sql);
    $topList = array();

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $topList[] = array(
                'name' => $row['name'],
                'sold' => intval($row['sold']),
                'amount' => floatval($row['amount']),
            );
        }
    }

    return $topList;
}
