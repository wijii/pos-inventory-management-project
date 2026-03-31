document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.href.split('/').pop();
  document.querySelectorAll('.sidebar li a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.closest('li').classList.add('active');
    } else {
      link.closest('li').classList.remove('active');
    }
  });
});

const sidebarBottom = document.createElement("div");
sidebarBottom.className = "sidebar-bottom";
sidebarBottom.innerHTML = `
  
  <img src="../assets/svgs/CafeLogo.svg" alt="Casa Cafe" />
  <span class="sidebar-brand-text">
    <span class="brand-white">Casa</span> <span class="brand-orange">Cafe</span>
  </span>

`;
document.querySelector(".sidebar").appendChild(sidebarBottom);
