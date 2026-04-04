const authAjax = {

    login: function(username, password, onSuccess, onError) {
        $.ajax({
            // URL to verify the login credentials
            url: "../../backend/routes.php?action=login",
            
            // POST method since we are sending sensitive data
            type: "POST",
            
            // The credentials we are sending to the server
            data: {
                username: username,
                password: password
            },
            
            // What to do when the server responds successfully
            success: function(response) {
                // Pass the server's response back to the onSuccess callback
                onSuccess(response);
            },
            
            // What to do if there is a network error or server error
            error: function(xhr, status, errorMessage) {
                // If an onError function was provided, call it with the error details.
                // Otherwise, just log the error to the console.
                if (onError) {
                    onError(xhr, status, errorMessage);
                } else {
                    console.error("AJAX Error:", errorMessage);
                }
            }
        });
    },

    logout: function(onSuccess, onError) {
        $.ajax({
            // URL to trigger the backend logout process
            url: '../../backend/routes.php?action=logout',
            
            // GET method is fine here as we are just requesting a session destroy
            type: 'GET',
            
            // What to do when the logout is successful
            success: function(response) {
                onSuccess(response);
            },
            
            // What to do if the logout request fails
            error: function(xhr, status, errorMessage) {
                if (onError) {
                    onError(xhr, status, errorMessage);
                } else {
                    console.error("Logout failed at server");
                }
            }
        });
    },

    getSession: function(onSuccess, onError) {
        $.ajax({
            // URL to check if a user is currently logged in
            url: '../../backend/routes.php?action=session',
            
            // GET method for retrieving session info
            type: 'GET',
            
            // Expect the server to return JSON
            dataType: 'json',
            
            // What to do when session info is fetched successfully
            success: function(response) {
                onSuccess(response);
            },
            
            // What to do if checking the session fails
            error: function(xhr, status, errorMessage) {
                if (onError) {
                    onError(xhr, status, errorMessage);
                } else {
                    console.error("Session fetch failed", errorMessage);
                }
            }
        });
    }

};
