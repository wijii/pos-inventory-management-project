const productsAjax = {

    verifyManager: function(password, onSuccess, onError) {
        $.ajax({
            url: '../../backend/routes.php?action=verifyManager',
            type: 'POST',
            data: { password: password },
            success: onSuccess,
            error: onError || function() { console.error("Network error during verification."); }
        });
    },

    addProduct: function(formData, onSuccess, onError) {
        $.ajax({
            url: '../../backend/routes.php?action=addProduct',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: onSuccess,
            error: onError || function() { console.error("Network error while adding product."); }
        });
    },

    updateProduct: function(data, onSuccess, onError) {
        $.ajax({
            url: '../../backend/routes.php?action=updateProduct',
            type: 'POST',
            data: data,
            success: onSuccess,
            error: onError || function() { console.error("Network error during update."); }
        });
    },

    deleteProduct: function(skuID, onSuccess, onError) {
        $.ajax({
            url: '../../backend/routes.php?action=deleteProduct',
            type: 'POST',
            data: { skuID: skuID },
            success: onSuccess,
            error: onError || function() { console.error("Network error during delete."); }
        });
    },

    getProductsTable: function(onSuccess, onError) {
        $.ajax({
            url: '../../backend/routes.php?action=getProductsTable',
            type: 'GET',
            success: onSuccess,
            error: onError || function() { console.error("Error loading products"); }
        });
    },

    getCategoriesDropdown: function(onSuccess, onError) {
        $.ajax({
            url: '../../backend/routes.php?action=getCategoriesDropdown',
            type: 'GET',
            success: onSuccess,
            error: onError || function() { console.error("Error loading categories"); }
        });
    }

};
