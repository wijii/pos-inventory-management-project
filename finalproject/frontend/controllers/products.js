const MANAGER_PASSWORD = "admin123";

let pendingProduct = null;
let selectedRow = null;
let selectedSkuID = null;
let selectedProductID = null;

function generateSKU(name) {
  const prefix = name.substring(0, 4).toUpperCase();
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${random}`;
}

function buildFoodRows(product) {
  const sku = generateSKU(product.name);
  return `
    <tr>
      <td>${product.name}</td>
      <td>${sku}</td>
      <td><span class="badge">Food</span></td>
      <td>₱${parseFloat(product.price).toFixed(2)}</td>
      <td>
        <button onclick="openUpdateModal(this)" class="edit"><i data-lucide="pencil"></i></button>
        <button onclick="openDeleteModal(this)" class="delete"><i data-lucide="trash-2"></i></button>
      </td>
    </tr>
  `;
}

function buildDrinkRows(product) {
  return product.sizes
    .map((size) => {
      const sku = generateSKU(product.name + size.label);
      return `
      <tr>
        <td>${product.name}</td>
        <td>${sku}</td>
        <td><span class="badge">Drink</span></td>
        <td>₱${parseFloat(size.price).toFixed(2)}</td>
        <td>
          <button onclick="openUpdateModal(this)" class="edit"><i data-lucide="pencil"></i></button>
          <button onclick="openDeleteModal(this)" class="delete"><i data-lucide="trash-2"></i></button>
        </td>
      </tr>
    `;
    })
    .join("");
}

// ============================================================
// UI / RENDERING
// ============================================================

function showAlert(message, isSuccess = false) {
  const alertsContainer = document.getElementById("alertsContainer");
  if (!alertsContainer) return;

  const alertBox = document.createElement("div");
  alertBox.classList.add("alerts");

  if (isSuccess) {
    alertBox.classList.add("success");
  }

  const icon = document.createElement("img");
  icon.src = "../assets/svgs/AlertLogo.svg";
  icon.classList.add("alert-icon");

  const text = document.createElement("span");
  text.textContent = message;

  alertBox.appendChild(icon);
  alertBox.appendChild(text);
  alertsContainer.appendChild(alertBox);

  setTimeout(() => alertBox.remove(), 3500);
}

function previewImage(inputId, previewId) {
  const input = document.getElementById(inputId);
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById(previewId);
    img.src = e.target.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function populateConfirmModal(name, category, priceText) {
  document.getElementById("confirmName").innerText = name;
  document.getElementById("confirmCategory").innerText = category;
  document.getElementById("confirmPrice").innerText = priceText;
}

// ============================================================
// MODALS
// ============================================================

function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function openFoodModal() {
  closeModal("typeModal");
  openModal("foodModal");
}

function openDrinkModal() {
  closeModal("typeModal");
  openModal("drinkModal");
}

function openUpdateModal(btn) {
  selectedRow = btn.closest("tr");
  const cells = selectedRow.querySelectorAll("td");

  //read the IDs that the server embedded in the data attributes of this row
  selectedSkuID = selectedRow.dataset.skuid;
  selectedProductID = selectedRow.dataset.productid;

  //pre-fill the modal with the row's current values
  //since cell 0 now has an image inside,look for the span that holds the name
  const nameSpan = cells[0].querySelector("span");
  document.querySelector(
    "#updateModal input[placeholder='Product name']",
  ).value = nameSpan ? nameSpan.innerText : cells[0].innerText;

  document.querySelector("#updateModal .row input[type='text']").value =
    cells[1].innerText;
  document.querySelector("#updateModal input[type='number']").value =
    cells[3].innerText.replace("₱", "").replaceAll(",", "");

  //pre-select the category using the CategoryID stored in the data attribute
  document.getElementById("updateCategory").value =
    selectedRow.dataset.categoryid;

  openModal("updateModal");
}

function openDeleteModal(btn) {
  selectedRow = btn.closest("tr");
  openModal("deleteModal");
}

function saveFood() {
  const name = document.getElementById("foodName").value;
  const price = document.getElementById("foodPrice").value;
  const imageFile = document.getElementById("foodImageInput").files[0];

  if (!name || !price) {
    showAlert("Please fill all fields!");
    return;
  }
  if (parseFloat(price) < 0) {
    showAlert("Price cannot be negative!");
    return;
  }

  //image size limit 2MB
  const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  if (imageFile && imageFile.size > maxSizeInBytes) {
    showAlert("Image is too large. Please upload a photo under 2MB.");
    return;
  }

  pendingProduct = { type: "Food", name, price, image: imageFile };
  populateConfirmModal(name, "Food", parseFloat(price).toFixed(2));

  closeModal("foodModal");
  openModal("confirmModal");
}

function saveDrink() {
  const name = document.getElementById("drinkName").value;
  const small = document.getElementById("smallPrice").value;
  const medium = document.getElementById("mediumPrice").value;
  const large = document.getElementById("largePrice").value;
  const imageFile = document.getElementById("drinkImageInput").files[0];

  if (!name || !small || !medium || !large) {
    showAlert("Please fill all fields!");
    return;
  }
  if (
    parseFloat(small) < 0 ||
    parseFloat(medium) < 0 ||
    parseFloat(large) < 0
  ) {
    showAlert("Prices cannot be negative!");
    return;
  }

  //image size limit 2mb
  const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  if (imageFile && imageFile.size > maxSizeInBytes) {
    showAlert("Image is too large. Please upload a photo under 2MB.");
    return;
  }

  pendingProduct = {
    type: "Drink",
    name,
    image: imageFile,
    sizes: [
      { label: "S", price: small },
      { label: "M", price: medium },
      { label: "L", price: large },
    ],
  };
  populateConfirmModal(name, "Drink", `${small} / ${medium} / ${large}`);

  closeModal("drinkModal");
  openModal("confirmModal");
}

function confirmSave() {
  const password = document.getElementById("managerPassword").value;

  if (!password) {
    showAlert("Please enter a password");
    return;
  }
  if (!pendingProduct) return;

  // First verify the password via backend
  productsAjax.verifyManager(
    password,
    function (verifyResult) {
      if (verifyResult.trim() === "Success") {
        // Password correct, now save the product
        saveProductToBackend();
      } else {
        showAlert("Incorrect manager password");
      }
    },
    function () {
      showAlert("Network error during verification.");
    },
  );
}

function saveProductToBackend() {
  const fd = new FormData();
  fd.append("type", pendingProduct.type);
  fd.append("name", pendingProduct.name);

  if (pendingProduct.image) {
    fd.append("image", pendingProduct.image);
  }

  if (pendingProduct.type === "Food") {
    fd.append("price", pendingProduct.price);
  } else if (pendingProduct.type === "Drink") {
    fd.append("smallPrice", pendingProduct.sizes[0].price);
    fd.append("mediumPrice", pendingProduct.sizes[1].price);
    fd.append("largePrice", pendingProduct.sizes[2].price);
  }

  //takes product FormData and passes to AJAX service for file upload/save
  productsAjax.addProduct(
    fd,
    function (result) {
      if (result.trim() === "Success") {
        pendingProduct = null;
        document.getElementById("managerPassword").value = "";
        closeModal("confirmModal");

        document.getElementById("successText").innerText =
          "Product securely added!";
        document.getElementById("generatedSKU").innerText = "Saved to Database";
        openModal("successModal");

        //refreshes the table with the new product
        productsAjax.getProductsTable(function (html) {
          document.getElementById("productTable").innerHTML = html;
          lucide.createIcons();
        });
      } else if (result.trim() === "ErrorImageTooLarge") {
        showAlert(
          "The image file is too large. Please choose a photo under 2MB.",
        );
      } else {
        showAlert("Failed to add product: " + result);
      }
    },
    function (err) {
      showAlert("Network error while adding product.");
    },
  );
}

document
  .getElementById("foodImageInput")
  .addEventListener("change", function () {
    previewImage("foodImageInput", "foodPreview");
  });

document
  .getElementById("drinkImageInput")
  .addEventListener("change", function () {
    previewImage("drinkImageInput", "drinkPreview");
  });

document
  .querySelector("#updateModal .saveBtn")
  .addEventListener("click", function () {
    if (!selectedRow) return;
    const name = document.querySelector(
      "#updateModal input[placeholder='Product name']",
    ).value;
    const skuCode = document.querySelector(
      "#updateModal .row input[type='text']",
    ).value;
    const price = document.querySelector(
      "#updateModal input[type='number']",
    ).value;
    const categoryID = document.getElementById("updateCategory").value;

    if (!name || !skuCode || !price || !categoryID) {
      showAlert("Please fill all fields");
      return;
    }

    if (!selectedSkuID || !selectedProductID) {
      showAlert("Error: Missing database IDs. Try refreshing the page.");
      return;
    }

    productsAjax.updateProduct(
      {
        skuID: selectedSkuID,
        productID: selectedProductID,
        name: name,
        skuCode: skuCode,
        price: price,
        categoryID: categoryID,
      },
      function (result) {
        if (result.trim() === "Success") {
          showAlert("Product updated successfully!", true);
          selectedRow = null;
          closeModal("updateModal");

          // Refresh table
          productsAjax.getProductsTable(function (html) {
            document.getElementById("productTable").innerHTML = html;
            lucide.createIcons();
          });
        } else {
          showAlert("Update failed: " + result);
        }
      },
      function (err) {
        showAlert("Network error during update.");
      },
    );
  });

document
  .querySelector("#deleteModal .deleteBtn")
  .addEventListener("click", function () {
    if (!selectedRow) {
      closeModal("deleteModal");
      return;
    }

    const skuID = selectedRow.dataset.skuid;
    if (!skuID) {
      showAlert("Error: Cannot delete. ID is missing.");
      return;
    }

    productsAjax.deleteProduct(
      skuID,
      function (result) {
        if (result.trim() === "Success") {
          selectedRow.remove();
          selectedRow = null;
          closeModal("deleteModal");
          showAlert("Product removed from view.", true);
        } else {
          showAlert("Delete failed: " + result);
        }
      },
      function (err) {
        showAlert("Network error during delete.");
      },
    );
  });

document.getElementById("searchInput").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll("#productTable tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});

window.onclick = function (e) {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (e.target === modal) modal.style.display = "none";
  });
};

document.addEventListener("DOMContentLoaded", function () {
  //load the products table on page load
  productsAjax.getProductsTable(
    function (html) {
      document.getElementById("productTable").innerHTML = html;
      lucide.createIcons();
    },
    function (err) {
      console.error("Error loading products:", err);
    },
  );

  //load the categories dropdown for the update modal
  productsAjax.getCategoriesDropdown(
    function (html) {
      const catSelect = document.getElementById("updateCategory");
      if (catSelect) catSelect.innerHTML = html;
    },
    function (err) {
      console.error("Error loading categories:", err);
    },
  );
});
