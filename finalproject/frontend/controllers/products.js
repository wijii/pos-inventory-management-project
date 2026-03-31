// ============================================================
// DATA
// ============================================================

const MANAGER_PASSWORD = "admin123";


// ============================================================
// STATE
// ============================================================

let pendingProduct = null;
let selectedRow    = null;


// ============================================================
// LOGIC
// ============================================================

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
  return product.sizes.map(size => {
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
  }).join("");
}

function confirmLogout() {
  window.location.href = "login.html";
}


// ============================================================
// UI / RENDERING
// ============================================================

function showAlert(message) {
  const alertsContainer = document.getElementById("alertsContainer");
  if (!alertsContainer) return;

  const alertBox = document.createElement("div");
  alertBox.classList.add("alerts");

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
  const file  = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img   = document.getElementById(previewId);
    img.src     = e.target.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function populateConfirmModal(name, category, priceText) {
  document.getElementById("confirmName").innerText     = name;
  document.getElementById("confirmCategory").innerText = category;
  document.getElementById("confirmPrice").innerText    = priceText;
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

  document.querySelector("#updateModal input[placeholder='Product name']").value = cells[0].innerText;
  document.querySelector("#updateModal .row input[type='text']").value            = cells[1].innerText;
  document.querySelector("#updateModal input[type='number']").value               = cells[3].innerText.replace("₱", "");
  document.getElementById("updateCategory").value                                 = cells[2].innerText.trim();

  openModal("updateModal");
}

function openDeleteModal(btn) {
  selectedRow = btn.closest("tr");
  openModal("deleteModal");
}

function saveFood() {
  const name  = document.getElementById("foodName").value;
  const price = document.getElementById("foodPrice").value;

  if (!name || !price) { showAlert("Please fill all fields!"); return; }
  if (parseFloat(price) < 0) { showAlert("Price cannot be negative!"); return; }

  pendingProduct = { type: "Food", name, price };
  populateConfirmModal(name, "Food", parseFloat(price).toFixed(2));

  closeModal("foodModal");
  openModal("confirmModal");
}

function saveDrink() {
  const name   = document.getElementById("drinkName").value;
  const small  = document.getElementById("smallPrice").value;
  const medium = document.getElementById("mediumPrice").value;
  const large  = document.getElementById("largePrice").value;

  if (!name || !small || !medium || !large) { showAlert("Please fill all fields!"); return; }
  if (parseFloat(small) < 0 || parseFloat(medium) < 0 || parseFloat(large) < 0) {
    showAlert("Prices cannot be negative!");
    return;
  }

  pendingProduct = {
    type: "Drink",
    name,
    sizes: [
      { label: "S", price: small  },
      { label: "M", price: medium },
      { label: "L", price: large  },
    ]
  };
  populateConfirmModal(name, "Drink", `${small} / ${medium} / ${large}`);

  closeModal("drinkModal");
  openModal("confirmModal");
}

function confirmSave() {
  const password = document.getElementById("managerPassword").value;

  if (password !== MANAGER_PASSWORD) { showAlert("Incorrect password"); return; }
  if (!pendingProduct) return;

  const table = document.getElementById("productTable");

  if (pendingProduct.type === "Food")  table.innerHTML += buildFoodRows(pendingProduct);
  if (pendingProduct.type === "Drink") table.innerHTML += buildDrinkRows(pendingProduct);

  // Reset
  pendingProduct = null;
  document.getElementById("managerPassword").value = "";
  closeModal("confirmModal");
  lucide.createIcons();

  document.getElementById("successText").innerText  = "Product added!";
  document.getElementById("generatedSKU").innerText = "Generated";
  openModal("successModal");
}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.getElementById("foodImageInput").addEventListener("change", function () {
  previewImage("foodImageInput", "foodPreview");
});

document.getElementById("drinkImageInput").addEventListener("change", function () {
  previewImage("drinkImageInput", "drinkPreview");
});

document.querySelector("#updateModal .saveBtn").addEventListener("click", function () {
  if (!selectedRow) return;

  const name     = document.querySelector("#updateModal input[placeholder='Product name']").value;
  const sku      = document.querySelector("#updateModal .row input[type='text']").value;
  const price    = document.querySelector("#updateModal input[type='number']").value;
  const category = document.getElementById("updateCategory").value;

  if (!name || !sku || !price || !category) { showAlert("Please fill all fields"); return; }
  if (parseFloat(price) < 0) { showAlert("Price cannot be negative!"); return; }

  const cells        = selectedRow.querySelectorAll("td");
  cells[0].innerText = name;
  cells[1].innerText = sku;
  cells[2].innerHTML = `<span class="badge">${category}</span>`;
  cells[3].innerText = `₱${parseFloat(price).toFixed(2)}`;

  selectedRow = null;
  closeModal("updateModal");
});

document.querySelector("#deleteModal .deleteBtn").addEventListener("click", function () {
  if (selectedRow) {
    selectedRow.remove();
    selectedRow = null;
  }
  closeModal("deleteModal");
});

document.getElementById("searchInput").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll("#productTable tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
  });
});

// Close modal on outside click
window.onclick = function (e) {
  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) modal.style.display = "none";
  });
};
