// ============================================================
// DATA
// ============================================================

const MANAGER_PASSWORD = "admin123";

let staff = [
  { name: "Jhonnas Pogi",   role: "Manager", email: "jhonnas@gmail.com", phone: "0994567891", status: "active", img: "https://i.pravatar.cc/200?img=1" },
  { name: "Jhonnas tlog",   role: "Cashier", email: "tlog@gmail.com",    phone: "0994567891", status: "active", img: "https://i.pravatar.cc/200?img=2" },
  { name: "Jhonnas Unggoy", role: "Manager", email: "unggoy@gmail.com",  phone: "0994567891", status: "off",    img: "https://i.pravatar.cc/200?img=3" },
];


// ============================================================
// STATE
// ============================================================

let staffIndexToDelete = null;


// ============================================================
// LOGIC
// ============================================================

function addStaff(name, role, email, phone) {
  staff.push({
    name,
    role,
    email,
    phone,
    status: "active",
    img: "https://i.pravatar.cc/200",
  });
}

function deleteStaffAt(index) {
  staff.splice(index, 1);
}

function getFilteredStaff(query) {
  return staff.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
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

  grid.innerHTML = list.map((s, index) => {
    const statusClass     = s.status === "active" ? "active" : "off";
    const textStatusClass = s.status === "active" ? "status-active" : "status-off";
    const roleClass       = s.role.toLowerCase();
    const statusLabel     = s.status === "active" ? "Active" : "Off Duty";

    return `
      <div class="card">
        <div class="status-label">
          <div class="status-dot ${statusClass}"></div>
          <span class="status-text ${textStatusClass}">${statusLabel}</span>
        </div>

        <div class="name">${s.name}</div>
        <div class="role ${roleClass}">${s.role}</div>

        <div class="info"><i data-lucide="mail"></i> ${s.email}</div>
        <div class="info"><i data-lucide="phone"></i> ${s.phone}</div>

        <button class="deleteBtn" onclick="openDeleteModal(${index})">
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

// Exposed globally so inline onclick can call it
window.openDeleteModal = function (index) {
  staffIndexToDelete = index;
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

    const formData        = new FormData(e.target);
    const name            = formData.get("name");
    const role            = formData.get("role");
    const email           = formData.get("email");
    const phone           = formData.get("phone");
    const enteredPassword = formData.get("password");

    if (!name || !role || !email || !phone || !enteredPassword) {
      showAlert("Please fill in all fields!");
      return;
    }

    if (enteredPassword !== MANAGER_PASSWORD) {
      showAlert("Incorrect manager password!");
      e.target.querySelector('input[name="password"]').value = "";
      return;
    }

    addStaff(name, role, email, phone);
    displayStaff(staff);
    showAlert("New staff member added!");
    closeModal("addStaffModal");
    e.target.reset();
  });

  // Confirm delete
  document.querySelector(".confirmDeleteBtn").addEventListener("click", () => {
    const enteredPassword = document.getElementById("managerPassword").value;

    if (enteredPassword !== MANAGER_PASSWORD) {
      showAlert("Incorrect manager password!");
      return;
    }

    deleteStaffAt(staffIndexToDelete);
    staffIndexToDelete = null;
    displayStaff(staff);
    closeModal("deleteModal");
    document.getElementById("managerPassword").value = "";
  });

  // Cancel delete
  document.querySelector(".cancelDeleteBtn").addEventListener("click", () => {
    closeModal("deleteModal");
    document.getElementById("managerPassword").value = "";
  });

});


// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  displayStaff(staff);
});
