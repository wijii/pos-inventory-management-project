const MANAGER_ONLY_PAGES = [
  "dashboard.html",
  "products.html",
  "inventory.html",
  "sales.html",
  "staff.html",
  "settings.html",
  "pos.html",
];

// manager can access all pages, no restriction list needed for them

//liks that cashier should not see
const CASHIER_HIDDEN_LINKS = [
  "dashboard.html",
  "products.html",
  "sales.html",
  "staff.html",
  "settings.html",
];

document.addEventListener("DOMContentLoaded", () => {
  //highlight the current page in the sidebar
  const currentPage = window.location.href.split("/").pop();
  document.querySelectorAll(".sidebar li a").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.closest("li").classList.add("active");
    } else {
      link.closest("li").classList.remove("active");
    }
  });

  //hide the page while the session check is running so users
  //don't briefly see the content before being redirected
  const overlay = document.getElementById("page-overlay");
  if (overlay) {
    overlay.style.display = "block";
  }

  //load the actual user session info and update the sidebar
  authAjax.getSession(
    function (data) {
      //if there is no active session, send to login.
      //the server returns role "Guest" when no one is logged in.
      if (data.role === "Guest") {
        alert("You are not logged in. Please log in to access this page.");
        window.location.href = "login.html";
        return;
      }

      //if cashier checks manager pages send back to cashier.html
      //manager has no restrictions, they can access all pages
      if (data.role === "Cashier" && MANAGER_ONLY_PAGES.includes(currentPage)) {
        alert("Access denied. You do not have permission to view that page.");
        window.location.href = "cashier.html";
        return;
      }

      //auth passed, hide the overlay and show the page
      if (overlay) {
        overlay.classList.add("fade-out");
        // Remove it from the DOM flow after the transition finishes so it doesn't block clicks
        setTimeout(() => overlay.style.display = "none", 500);
      }

      //update the sidebar logo with the real user info.
      const sidebarLogo = document.querySelector(".sidebar .logo");
      if (sidebarLogo) {
        sidebarLogo.innerHTML = `
              <h2>${data.role}</h2>
              <p>${data.firstname}</p>
            `;
      }

      //if cashier hide the manager-only sidebar links
      if (data.role === "Cashier") {
        document.querySelectorAll(".sidebar li a").forEach(function (link) {
          const href = link.getAttribute("href");
          if (CASHIER_HIDDEN_LINKS.includes(href)) {
            link.closest("li").style.display = "none";
          }
        });
      }
    },
    function (err) {
      //if session check fails back to login
      console.error("Session fetch failed", err);
      window.location.href = "login.html";
    },
  );

  //add the Casa Cafe branding at the bottom if a sidebar exists
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
      const sidebarBottom = document.createElement("div");
      sidebarBottom.className = "sidebar-bottom";
      sidebarBottom.innerHTML = `
          <img src="../assets/svgs/CafeLogo.svg" alt="Store Logo" />
          <span class="sidebar-brand-text" id="navStoreName">
            <span class="brand-white">Casa</span> <span class="brand-orange">Cafe</span>
          </span>
        `;
      sidebar.appendChild(sidebarBottom);
  }

  // Fetch the actual store name dynamically
  fetch("../../backend/routes.php?action=getStoreSettings")
    .then(r => r.json())
    .then(data => {
        if(data && data.storeName) {
            const el = document.getElementById("navStoreName");
            if(el) {
                const nameParts = data.storeName.trim().split(" ");
                if(nameParts.length > 1) {
                     el.innerHTML = `<span class="brand-white">${nameParts[0]}</span> <span class="brand-orange">${nameParts.slice(1).join(" ")}</span>`;
                } else {
                     el.innerHTML = `<span class="brand-orange">${data.storeName}</span>`;
                }
            }
        }
    }).catch(e => console.error("Failed to fetch store name", e));
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

//logout logic: fires one last silent backup to capture end-of-day sales, then logs out.
function confirmLogout() {
  // End-of-Day Backup: Runs the backup one final time before the session is destroyed.
  // The .finally() ensures logout always proceeds even if the backup fetch fails.
  fetch("../../backend/routes.php?action=runAutoBackup")
    .finally(function () {
      authAjax.logout(
        function (result) {
          if (result.trim() === "Success") {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
          } else {
            console.error("Logout failed at server, forcing local logout.");
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
          }
        },
        function () {
          localStorage.removeItem("loggedInUser");
          window.location.href = "login.html";
        },
      );
    });
}
