// ============================================================
// DATA
// ============================================================

const MANAGER_PASSWORD = "admin123";

// ============================================================
// STATE
// ============================================================

let staff = []; // will be loaded from DB
let selectedUserId = null; // ✅ use this consistently

// ============================================================
// LOGIC
// ============================================================

// Fetch staff list from backend
function fetchStaff() {
  fetch("/project/finalproject/backend/routes.php?action=getStaffList")
    .then(response => response.json())
    .then(staffList => {
      staff = staffList;
      displayStaff(staff);
    })
    .catch(err => console.error("Error fetching staff:", err));
}

function addStaff(roleID, username, password, firstName, lastName, phoneNo, emailAddress, workingStatus) {
   return fetch("/project/finalproject/backend/routes.php?action=addStaff", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ 
      roleID, 
      username, 
      password, 
      firstName, 
      lastName, 
      phoneNo, 
      emailAddress, 
      workingStatus 
    })
  }).then(response => response.json());
}

function deleteStaffAt(userId) {
  return fetch("/project/finalproject/backend/routes.php?action=deleteStaff", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ UserID: userId }) 
  }).then(response => response.json());
}

function getFilteredStaff(query) {
  return staff.filter(s => `${s.FirstName} ${s.LastName}`.toLowerCase().includes(query.toLowerCase())); 
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

function displayStaff(list) {
  const grid = document.getElementById("staffGrid");

  // Map RoleID to readable role names
  const roleMap = {
    1: "Manager",
    2: "Cashier"
  };

  grid.innerHTML = list.map((s) => {
    const isActive = (s.WorkingStatus === "Active");
    const statusClass     = isActive ? "active" : "off";
    const textStatusClass = isActive ? "status-active" : "status-off";
    const roleClass       = roleMap[s.RoleID]?.toLowerCase() || "unknown";
    const statusLabel     = isActive ? "On Duty" : "Off Duty";

    return `
      <div class="card">
        <div class="status-label">
          <div class="status-dot ${statusClass}"></div>
          <span class="status-text ${textStatusClass}">${statusLabel}</span>
        </div>

        <div class="name">${s.FirstName} ${s.LastName}</div>
        <div class="role ${roleClass}">${roleMap[s.RoleID] || "Unknown"}</div>

        <div class="info"><i data-lucide="mail"></i> ${s.EmailAddress}</div>
        <div class="info"><i data-lucide="phone"></i> ${s.PhoneNo}</div>

        <button class="deleteBtn" onclick="openDeleteModal(${s.UserID})">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
  }).join("");

  lucide.createIcons();
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

window.openDeleteModal = function (userId) {
  selectedUserId = userId; // ✅ store the UserID globally
  openModal("deleteModal");
};

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Toggle password visibility
  document.getElementById("togglePassword").addEventListener("click", function () {
    const input = document.getElementById("managerPassword");
    input.type  = input.type === "password" ? "text" : "password";
  });

  // Search
  document.getElementById("search").addEventListener("keyup", function () {
    displayStaff(getFilteredStaff(this.value));
  });

  // Open add modal
  document.querySelector(".addBtn").addEventListener("click", () => {
    openModal("addStaffModal");
  });

  // Cancel add modal
  document.querySelector(".cancelBtn").addEventListener("click", () => {
    closeModal("addStaffModal");
    document.getElementById("addStaffForm").reset();
  });

  // Submit add form
document.getElementById("addStaffForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const roleID = formData.get("roleID"); // 1 or 2
  const username = formData.get("username");
  const password = formData.get("password");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const phoneNo = formData.get("phoneNo");
  const emailAddress = formData.get("emailAddress");
  const workingStatus = formData.get("workingStatus");
  const enteredPassword = formData.get("managerPassword");

  if (enteredPassword !== MANAGER_PASSWORD) {
    showAlert("Incorrect manager password!");
    return;
  }

    addStaff(roleID, username, password, firstName, lastName, phoneNo, emailAddress, workingStatus)
    .then(result => {
      if (result.success) {
        showAlert("New staff member added!");
        fetchStaff();
        closeModal("addStaffModal");
        e.target.reset();
      } else {
        showAlert("Failed to add staff.");
      }
    });
});


    // Confirm delete
    document.querySelector(".confirmDeleteBtn").addEventListener("click", () => {
    const enteredPassword = document.getElementById("managerPassword").value;

    if (enteredPassword !== MANAGER_PASSWORD) {
      showAlert("Incorrect manager password!");
      return;
    }

    deleteStaffAt(selectedUserId).then(result => {
    if (result.success) {
      showAlert("Staff member deleted!");
      fetchStaff();
      closeModal("deleteModal");
      document.getElementById("managerPassword").value = "";
      selectedUserId = null;
    } else {
      showAlert("Cannot delete the staff member who is On Duty.");
    }
  });

  });

  // Cancel delete
  document.querySelector(".cancelDeleteBtn").addEventListener("click", () => {
    closeModal("deleteModal");
    document.getElementById("managerPassword").value = "";
    selectedUserId = null;
  });

  // Initial load from DB
  fetchStaff();
});