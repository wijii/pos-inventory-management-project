// ============================================================
// LOGIC
// ============================================================

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
  icon.src = "../assets/svgs/circle-alert.svg";
  icon.classList.add("alert-icon");

  const text = document.createElement("span");
  text.textContent = message;

  alertBox.appendChild(icon);
  alertBox.appendChild(text);
  alertsContainer.appendChild(alertBox);

  setTimeout(() => alertBox.remove(), 3500);
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

// ============================================================
// EVENT LISTENERS & AJAX
// ============================================================

document.getElementById("saveAccount").addEventListener("click", () => {
  const btn = document.getElementById("saveAccount");
  btn.textContent = "Saving...";
  
  $.post("/project/finalproject/backend/routes.php?action=saveUserProfile", {
    firstname: document.getElementById("firstname").value,
    lastname: document.getElementById("lastname").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  }, function(response) {
    btn.textContent = "Save Changes";
    const res = JSON.parse(response);
    if (res.success) {
      document.getElementById("password").value = ""; // clear password after save
      showAlert("Account settings saved!");
    } else {
      showAlert("Failed to save account settings.");
    }
  });
});

document.getElementById("saveStore").addEventListener("click", () => {
  const btn = document.getElementById("saveStore");
  btn.textContent = "Saving...";

  $.post("/project/finalproject/backend/routes.php?action=saveStoreSettings", {
    storeName: document.getElementById("storeName").value,
    storeEmail: document.getElementById("storeEmail").value,
    contactNumber: document.getElementById("contactNumber").value
  }, function(response) {
    btn.textContent = "Save Store Info";
    const res = JSON.parse(response);
    if (res.success) showAlert("Store info saved!");
  });
});

document.getElementById("saveTax").addEventListener("click", () => {
  const btn = document.getElementById("saveTax");
  btn.textContent = "Saving...";

  $.post("/project/finalproject/backend/routes.php?action=saveTaxSettings", {
    taxRate: document.getElementById("taxRate").value,
    stockAlert: document.getElementById("stockAlert").value
  }, function(response) {
    btn.textContent = "Save";
    const res = JSON.parse(response);
    if (res.success) showAlert("Tax & alerts saved!");
  });
});

// ============================================================
// INIT
// ============================================================

window.onload = () => {
  // Load Account Profile
  $.get("/project/finalproject/backend/routes.php?action=getUserProfile", function(response) {
    if (response) {
      const data = JSON.parse(response);
      if (data.FirstName) document.getElementById("firstname").value = data.FirstName;
      if (data.LastName) document.getElementById("lastname").value = data.LastName;
      if (data.Username) document.getElementById("username").value = data.Username;
      if (data.EmailAddress) document.getElementById("email").value = data.EmailAddress;
    }
  });

  // Load System Settings
  $.get("/project/finalproject/backend/routes.php?action=getStoreSettings", function(response) {
    if (response) {
      const data = JSON.parse(response);
      if (data.storeName) document.getElementById("storeName").value = data.storeName;
      if (data.storeEmail) document.getElementById("storeEmail").value = data.storeEmail;
      if (data.contactNumber) document.getElementById("contactNumber").value = data.contactNumber;
      if (data.taxRate) document.getElementById("taxRate").value = data.taxRate;
      if (data.stockAlert) document.getElementById("stockAlert").value = data.stockAlert;
    }
  });
};
