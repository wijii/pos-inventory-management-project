document.addEventListener('DOMContentLoaded', () => {
    //highlight the current page in the sidebar
    const currentPage = window.location.href.split('/').pop();
    document.querySelectorAll('.sidebar li a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.closest('li').classList.add('active');
        } else {
            link.closest('li').classList.remove('active');
        }
    });

    //load the actual user session info and update the sidebar
    $.ajax({
        url: '../../backend/routes.php?action=session',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const sidebarLogo = document.querySelector(".sidebar .logo");
            if (sidebarLogo) {
                //update "Manager" and Name with real data from DB
                sidebarLogo.innerHTML = `
                  <h2>${data.role}</h2>
                  <p>${data.firstname}</p>
                `;
            }
        },
        error: function (err) {
            console.error("Session fetch failed", err);
        }
    });

    //add the Casa Cafe branding at the bottom
    const sidebarBottom = document.createElement("div");
    sidebarBottom.className = "sidebar-bottom";
    sidebarBottom.innerHTML = `
      <img src="../assets/svgs/CafeLogo.svg" alt="Casa Cafe" />
      <span class="sidebar-brand-text">
        <span class="brand-white">Casa</span> <span class="brand-orange">Cafe</span>
      </span>
    `;
    document.querySelector(".sidebar").appendChild(sidebarBottom);
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

//logout logic 
function confirmLogout() {
    $.ajax({
        url: '../../backend/routes.php?action=logout',
        type: 'GET',
        success: function (result) {
            if (result.trim() === "Success") {
                // Clear local storage and redirect to login
                localStorage.removeItem("loggedInUser");
                window.location.href = "login.html";
            } else {
                console.error("Logout failed at server, forcing local logout.");
                localStorage.removeItem("loggedInUser");
                window.location.href = "login.html";
            }
        },
        error: function () {
            //even if server fails,clear local and redirect
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        }
    });
}
