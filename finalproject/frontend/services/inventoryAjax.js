const inventoryAjax = {

  getInventory: function (onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=getInventoryJSON",
      type: "GET",
      dataType: "json",
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, errorMessage) {
        if (onError) {
          onError(xhr, status, errorMessage);
        } else {
          console.error("AJAX Error fetching inventory:", errorMessage);
        }
      },
    });
  },

  updateStock: function (skuCode, newStock, onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=updateInventoryStock",
      type: "POST",
      data: {
        skuCode: skuCode,
        newStock: newStock,
      },
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, errorMessage) {
        if (onError) {
          onError(xhr, status, errorMessage);
        } else {
          console.error("AJAX Error updating stock:", errorMessage);
        }
      },
    });
  },

};
