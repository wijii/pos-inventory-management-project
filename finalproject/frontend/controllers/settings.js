// Logic: Contains general application functions such as handling authentication logouts.
// confirmLogout is handled globally in navigationbar.js

// UI Renderers: Mounts custom notification alerts whenever settings are saved.
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

// Modal Actions: Toggles popup menus.
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Event Listeners & AJAX: Binds save buttons to HTTP post requests to update database flags.
$(document).ready(function() {
  
  // Save Store Info
  document.getElementById("saveStore")?.addEventListener("click", () => {
    const btn = document.getElementById("saveStore");
    const originalText = btn.textContent;
    btn.textContent = "Saving...";

    $.ajax({
      url: "../../backend/routes.php?action=saveStoreSettings",
      type: "POST",
      data: {
        storeName: document.getElementById("storeName").value,
        storeEmail: document.getElementById("storeEmail").value,
        contactNumber: document.getElementById("contactNumber").value
      },
      dataType: "json",
      success: function(res) {
        btn.textContent = originalText;
        if (res.success) showAlert("Store info saved!");
      },
      error: function() {
        btn.textContent = originalText;
        showAlert("Error saving store info.");
      }
    });
  });

  // Save Tax & Alerts
  document.getElementById("saveTax")?.addEventListener("click", () => {
    const btn = document.getElementById("saveTax");
    const originalText = btn.textContent;
    btn.textContent = "Saving...";

    $.ajax({
      url: "../../backend/routes.php?action=saveTaxSettings",
      type: "POST",
      data: {
        taxRate: document.getElementById("taxRate").value,
        stockAlert: document.getElementById("stockAlert").value
      },
      dataType: "json",
      success: function(res) {
        btn.textContent = originalText;
        if (res.success) showAlert("Tax & alerts saved!");
      },
      error: function() {
        btn.textContent = originalText;
        showAlert("Error saving tax settings.");
      }
    });
  });

  // Load System Settings
  $.ajax({
    url: "../../backend/routes.php?action=getStoreSettings",
    type: "GET",
    dataType: "json",
    success: function(data) {
      if (data) {
        if (data.storeName) document.getElementById("storeName").value = data.storeName;
        if (data.storeEmail) document.getElementById("storeEmail").value = data.storeEmail;
        if (data.contactNumber) document.getElementById("contactNumber").value = data.contactNumber;
        if (data.taxRate) document.getElementById("taxRate").value = data.taxRate;
        if (data.stockAlert) document.getElementById("stockAlert").value = data.stockAlert;
      }
    },
    error: function() {
      console.error("Failed to load settings.");
    }
  });

});
