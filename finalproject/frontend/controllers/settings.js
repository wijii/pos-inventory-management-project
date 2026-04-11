// Logic: Contains general application functions such as handling authentication logouts.
function confirmLogout() {
  authAjax.logout(
    function() { window.location.href = "login.html"; },
    function() { window.location.href = "login.html"; }
  );
}

// UI Renderers: Mounts custom notification alerts whenever settings are saved.
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

// Modal Actions: Toggles popup menus.
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Event Listeners & AJAX: Binds save buttons to HTTP post requests to update database flags.
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

// Initializer Script: Queries backend for current values to pre-populate form inputs on load.
window.onload = () => {


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
