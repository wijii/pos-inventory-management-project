// ============================================================
// DATA
// ============================================================

const SETTINGS_FIELDS = {
  account: ["fullname", "username", "email", "password"],
  store:   ["storeName", "storeEmail", "contactNumber"],
  tax:     ["taxRate", "stockAlert"],
};

const SETTINGS_DEFAULTS = {
  taxRate:    5,
  stockAlert: 5,
};


// ============================================================
// LOGIC
// ============================================================

function saveFields(fields) {
  fields.forEach(id => {
    localStorage.setItem(id, document.getElementById(id).value);
  });
}

function loadFields(fields) {
  fields.forEach(id => {
    document.getElementById(id).value =
      localStorage.getItem(id) ?? (SETTINGS_DEFAULTS[id] ?? "");
  });
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
// EVENT LISTENERS
// ============================================================

document.getElementById("saveAccount").addEventListener("click", () => {
  saveFields(SETTINGS_FIELDS.account);
  showAlert("Account settings saved!");
});

document.getElementById("saveStore").addEventListener("click", () => {
  saveFields(SETTINGS_FIELDS.store);
  showAlert("Store info saved!");
});

document.getElementById("saveTax").addEventListener("click", () => {
  saveFields(SETTINGS_FIELDS.tax);
  showAlert("Tax & alerts saved!");
});


// ============================================================
// INIT
// ============================================================

window.onload = () => {
  loadFields(SETTINGS_FIELDS.account);
  loadFields(SETTINGS_FIELDS.store);
  loadFields(SETTINGS_FIELDS.tax);
};
