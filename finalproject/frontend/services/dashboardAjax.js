const dashboardAjax = {
  //fetches all dashboard analytics for a given period from the backend.
  // period 'daily', 'weekly', or 'monthly'
  getStats: function (period, onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=getDashboardStats&period=" + period,
      type: "GET",
      dataType: "json",
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, errorMessage) {
        onError(xhr, status, errorMessage);
      },
    });
  },
};
