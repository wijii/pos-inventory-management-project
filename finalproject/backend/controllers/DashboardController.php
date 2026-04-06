<?php

session_start();

include __DIR__ . '/../config/connect.php';
include __DIR__ . '/../models/DashboardModel.php';

// only logged in managers should be able to get dashboard data
if (!isset($_SESSION['user_id'])) {
    echo json_encode(array('error' => 'Not logged in'));
    exit;
}

$action = '';
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

if ($action === 'getDashboardStats') {

    // which time period does the frontend want?
    $period = 'daily';
    if (isset($_GET['period']) && in_array($_GET['period'], array('daily', 'weekly', 'monthly'))) {
        $period = $_GET['period'];
    }

    // run all four queries
    $summary     = getDashboardSummary($conn, $period);
    $lowStock    = getLowStockCount($conn);
    $chartData   = getDashboardChartData($conn, $period);
    $topProducts = getDashboardTopProducts($conn, $period);

    $response = array(
        'period'       => $period,
        'sales'        => $summary['totalSales'],
        'transactions' => $summary['totalTransactions'],
        'avg'          => $summary['avgTransaction'],
        'lowStock'     => $lowStock,
        'chartLabels'  => $chartData['labels'],
        'chartValues'  => $chartData['values'],
        'topProducts'  => $topProducts,
    );

    header('Content-Type: application/json');
    echo json_encode($response);

} else {
    echo json_encode(array('error' => 'Unrecognized dashboard action'));
}
