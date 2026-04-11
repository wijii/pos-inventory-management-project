// ============================================================
// DATA
// ============================================================

// Manager password validation handled by server
let staff = [];

// ============================================================
// STATE
// ============================================================

let staffIdToDelete = null;

// ============================================================
// LOGIC
// ============================================================

function fetchStaff() {
  staffAjax.getStaffList()
    .then(data => {
      staff = data;
      displayStaff(staff);
    })
    .catch(err => console.error("Error fetching staff:", err));
}

function getFilteredStaff(query) {
  return staff.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );
}

function confirmLogout() {
    authAjax.logout(
        function (result) {
            if (result.trim() === "Success") {
                localStorage.removeItem("loggedInUser");
                window.location.href = "login.html";
            } else {
                localStorage.removeItem("loggedInUser");
                window.location.href = "login.html";
            }
        },
        function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        }
    );
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

  grid.innerHTML = list
    .map((s) => {
      const statusClass = s.status === "active" ? "active" : "off";
      const textStatusClass =
        s.status === "active" ? "status-active" : "status-off";
      const roleClass = s.role.toLowerCase();
      const statusLabel = s.status === "active" ? "Active" : "Off Duty";

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

        <button class="deleteBtn" onclick="openDeleteModal(${s.id})">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
    })
    .join("");

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
window.openDeleteModal = function (userId) {
  staffIdToDelete = userId;
  openModal("deleteModal");
};

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Toggle password visibility
  document
    .getElementById("togglePassword")
    .addEventListener("click", function () {
      const input = document.getElementById("managerPassword");
      input.type = input.type === "password" ? "text" : "password";
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
    const firstname = formData.get("firstname");
    const lastname = formData.get("lastname");
    const username = formData.get("username");
    const role = formData.get("role");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const enteredPassword = formData.get("password");

    if (!firstname || !lastname || !username || !role || !email || !phone || !enteredPassword) {
      showAlert("Please fill in all fields!");
      return;
    }

    staffAjax.addStaff(firstname, lastname, username, role, email, phone, enteredPassword).then(res => {
        if(res.success){
            showAlert("New staff member added!");
            fetchStaff();
            closeModal("addStaffModal");
            e.target.reset();
        } else {
            showAlert("Failed to add staff member.");
        }
    }).catch(err => {
        showAlert("Server error!");
    });

  });

  // Confirm delete
  document.querySelector(".confirmDeleteBtn").addEventListener("click", () => {
    const enteredPassword = document.getElementById("managerPassword").value;

    if(!enteredPassword) {
        showAlert("Please enter manager password!");
        return;
    }

    staffAjax.verifyManager(enteredPassword)
    .then(verdict => {
        if(verdict.trim() !== "Success") {
            showAlert("Incorrect manager password!");
            return;
        }

        staffAjax.deleteStaff(staffIdToDelete).then(res => {
            if(res.success) {
                showAlert("Staff member deleted!");
                fetchStaff();
                closeModal("deleteModal");
                document.getElementById("managerPassword").value = "";
                staffIdToDelete = null;
            } else {
                showAlert("Cannot delete the staff member who is On Duty.");
            }
        });
    });
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
  fetchStaff();
});
