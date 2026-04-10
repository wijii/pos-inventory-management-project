const salesAjax = {

  //fetches lifetime total revenue, transaction count, and avg ticket
  getLifetimeStats: function (onSuccess, onError) {
    $.ajax({
      url: '../../backend/routes.php?action=getSalesLifetimeStats',
      type: 'GET',
      dataType: 'json',
      success: function (response) { onSuccess(response); },
      error: function (xhr, status, err) { onError(xhr, status, err); },
    });
  },

  //fetches revenue + transaction count chart data for a given period
  //period: 'daily', 'weekly', or 'monthly'
  getChartData: function (period, onSuccess, onError) {
    $.ajax({
      url: '../../backend/routes.php?action=getSalesChartData&period=' + period,
      type: 'GET',
      dataType: 'json',
      success: function (response) { onSuccess(response); },
      error: function (xhr, status, err) { onError(xhr, status, err); },
    });
  },

  //fetches all-time product sales ranking
  getProductBreakdown: function (onSuccess, onError) {
    $.ajax({
      url: '../../backend/routes.php?action=getSalesProductBreakdown',
      type: 'GET',
      dataType: 'json',
      success: function (response) { onSuccess(response); },
      error: function (xhr, status, err) { onError(xhr, status, err); },
    });
  },

  //fetches the full transaction history list
  getTransactionHistory: function (onSuccess, onError) {
    $.ajax({
      url: '../../backend/routes.php?action=getSalesTransactionHistory',
      type: 'GET',
      dataType: 'json',
      success: function (response) { onSuccess(response); },
      error: function (xhr, status, err) { onError(xhr, status, err); },
    });
  },

  //fetches the individual item breakdown for a single transaction (for receipt modal)
  getReceiptItems: function (transactionID, onSuccess, onError) {
    $.ajax({
      url: '../../backend/routes.php?action=getSalesReceiptItems&transactionID=' + transactionID,
      type: 'GET',
      dataType: 'json',
      success: function (response) { onSuccess(response); },
      error: function (xhr, status, err) { onError(xhr, status, err); },
    });
  },

};
