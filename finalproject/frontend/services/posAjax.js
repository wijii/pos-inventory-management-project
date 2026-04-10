const posAjax = {
  checkout: function (cash, total, cart, paymentMethod, discountAmount, onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=checkout",
      type: "POST",
      data: {
        amountPaid: cash,
        totalAmountDue: total,
        cartItems: cart,
        paymentMethod: paymentMethod,
        discountAmount: discountAmount
      },
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, errorMessage) {
        onError(xhr, status, errorMessage);
      },
    });
  },

  getProducts: function (onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=getPOSProductsJSON",
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
