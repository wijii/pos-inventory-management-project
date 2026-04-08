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

  //adds a quantity delta to an existing SKU's stock and logs the change
  restock: function (skuCode, addQty, note, onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=restockInventory",
      type: "POST",
      dataType: "json",
      data: {
        skuCode: skuCode,
        addQty:  addQty,
        note:    note,
      },
      success: function (response) { onSuccess(response); },
      error:   function (xhr, status, err) { onError(xhr, status, err); },
    });
  },

  //fetches the full inventory audit trail
  getLogs: function (onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=getInventoryLogs",
      type: "GET",
      dataType: "json",
      success: function (response) { onSuccess(response); },
      error:   function (xhr, status, err) { onError(xhr, status, err); },
    });
  },

};

