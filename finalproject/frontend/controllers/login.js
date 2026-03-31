// ============================================================
// DATA
// ============================================================

const USERS = [
  { username: "admin",   password: "admin123",   redirect: "dashboard.html" },
  { username: "cashier", password: "cashier123", redirect: "cashier.html"   },
];


// ============================================================
// LOGIC
// ============================================================

function findUser(username, password) {
  return USERS.find(u => u.username === username && u.password === password);
}

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


// ============================================================
// EVENT LISTENERS
// ============================================================

document.getElementById("showPw").addEventListener("change", function () {
  document.getElementById("password").type = this.checked ? "text" : "password";
});

document.getElementById("username").addEventListener("input", updateButtonColor);
document.getElementById("password").addEventListener("input", updateButtonColor);

document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showAlert("Please fill in both username and password");
    return;
  }

  const user = findUser(username, password);

  if (user) {
    saveSession(user.username);
    window.location.href = user.redirect;
  } else {
    showAlert("Invalid username or password");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("loginBtn").click();
});


// ============================================================
// INIT
// ============================================================

updateButtonColor();
