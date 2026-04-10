const authAjax = {
  login: function (username, password, onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=login",
      type: "POST",
      data: {
        username: username,
        password: password,
      },
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, errorMessage) {
        // If an onError function was provided, call it with the error details.
        // Otherwise, just log the error to the console.
        if (onError) {
          onError(xhr, status, errorMessage);
        } else {
          console.error("AJAX Error:", errorMessage);
        }
      },
    });
  },

  logout: function (onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=logout",
      type: "GET",
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, errorMessage) {
        if (onError) {
          onError(xhr, status, errorMessage);
        } else {
          console.error("Logout failed at server");
        }
      },
    });
  },

  getSession: function (onSuccess, onError) {
    $.ajax({
      url: "../../backend/routes.php?action=session",
      type: "GET",
      dataType: "json",
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, errorMessage) {
        if (onError) {
          onError(xhr, status, errorMessage);
        } else {
          console.error("Session fetch failed", errorMessage);
        }
      },
    });
  },
};
