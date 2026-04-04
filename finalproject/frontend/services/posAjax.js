const posAjax = {

    checkout: function(cash, total, cart, onSuccess, onError) {
        $.ajax({
            // The URL of the backend script handling the checkout
            url: '../../backend/routes.php?action=checkout',
            
            // The type of HTTP method used (POST for sending data securely)
            type: 'POST',
            
            // The data we are sending to the server
            data: {
                amountPaid: cash,
                totalAmountDue: total,
                cartItems: cart
            },
            
            // What to do when the server responds successfully
            // 'success' expects a function that takes the server's response.
            // By wrapping 'onSuccess' in an explicit function, it becomes clearer
            // that we are receiving a response and then passing it to our callback.
            success: function(response) {
                // Call the onSuccess function that was passed in, giving it the response
                onSuccess(response);
            },
            
            // What to do if there is a network error or server error (e.g., 500 Internal Server Error)
            error: function(xhr, status, errorMessage) {
                // Call the onError function that was passed in, useful for displaying an error alert
                onError(xhr, status, errorMessage);
            }
        });
    },

    getProducts: function(onSuccess, onError) {
        $.ajax({
            // The URL to fetch products from
            url: '../../backend/routes.php?action=getPOSProductsJSON',
            
            // GET method is used for retrieving data
            type: 'GET',
            
            // We tell jQuery to automatically parse the response as JSON format
            dataType: 'json',
            
            // What to do when the products are successfully fetched
            success: function(response) {
                // Pass the fetched products (response) to our custom onSuccess function
                onSuccess(response);
            },
            
            // What to do if the fetching process fails
            error: function(xhr, status, errorMessage) {
                // Pass the error details to our custom onError function
                onError(xhr, status, errorMessage);
            }
        });
    }

};
