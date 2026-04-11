// ============================================================
// DATA & SESSION
// ============================================================

function saveSession(username) {
  localStorage.setItem("loggedInUser", username);
}

// ============================================================
// UI / RENDERING
// ============================================================

function updateButtonColor() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");

  loginBtn.style.backgroundColor = username && password ? "#d9840d" : "#825417";
}

//event listeners

document.getElementById("showPw").addEventListener("change", function () {
  document.getElementById("password").type = this.checked ? "text" : "password";
});

document
  .getElementById("username")
  .addEventListener("input", updateButtonColor);
document
  .getElementById("password")
  .addEventListener("input", updateButtonColor);

document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showAlert("Please provide both your username and password.");
    return;
  }

  // GETS values from UI and passes to AJAX service
  authAjax.login(
    username,
    password,
    function (result) {
      if (result.trim() === "Manager" || result.trim() === "Cashier") {
        localStorage.setItem("loggedInUser", username);
        if (result.trim() === "Manager") {
          window.location.href = "dashboard.html";
        } else {
          window.location.href = "cashier.html";
        }
      } else {
        showAlert("Please check your credentials and try again.");
      }
    },
    function (error) {
      console.error("AJAX Error:", error);
      showAlert("System error: Unable to connect to the server.");
    },
  );
});

//shared alert function
function showAlert(message) {
  const alertsContainer = document.getElementById("alertsContainer");
  if (!alertsContainer) return;

  const alertBox = document.createElement("div");
  alertBox.classList.add("alerts");

  // Adjust path based on where we are
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

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("loginBtn").click();
});

// ============================================================
// INIT
// ============================================================

updateButtonColor();
