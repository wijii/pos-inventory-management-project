// ============================================================
// DATA & SESSION
// ============================================================

function saveSession(username) {
  localStorage.setItem("loggedInUser", username);
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

function updateButtonColor() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");

  loginBtn.style.backgroundColor = (username && password) ? "#d9840d" : "#825417";
}


//event listeners


document.getElementById("showPw").addEventListener("change", function () {
  document.getElementById("password").type = this.checked ? "text" : "password";
});

document.getElementById("username").addEventListener("input", updateButtonColor);
document.getElementById("password").addEventListener("input", updateButtonColor);

document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showAlert("Please provide both your username and password.");
    return;
  }

  // ajax
  $.ajax({
    url: "../../backend/routes.php?action=login",
    type: "POST",
    data: {
      username: username,
      password: password
    },
    success: function (result) {

      if (result === "Manager" || result === "Cashier") {

        localStorage.setItem("loggedInUser", username);

        if (result === "Manager") {
          window.location.href = "dashboard.html";
        } else {
          window.location.href = "cashier.html";
        }
      } else {
        showAlert("Please check your credentials and try again.");
      }
    },
    error: function (error) {
      console.error("AJAX Error:", error);
      showAlert("System error: Unable to connect to the server.");
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("loginBtn").click();
});


// ============================================================
// INIT
// ============================================================

updateButtonColor();
