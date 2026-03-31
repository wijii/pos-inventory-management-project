// ============================================================
// DATA
// ============================================================

const inventoryData = [
  { id: "BITCH-051", name: "Dark Choco Macchiato", stock: 31,  threshold: 10, lastUpdated: Date.now() - 8*24*60*60*1000 },
  { id: "BITCH-201", name: "Matcha Overload",      stock: 314, threshold: 10, lastUpdated: Date.now() - 8*24*60*60*1000 },
  { id: "BITCH-501", name: "Mango Overload",       stock: 214, threshold: 10, lastUpdated: Date.now() - 8*24*60*60*1000 },
  { id: "BITCH-301", name: "Caramel Chocolate",    stock: 3,   threshold: 10, lastUpdated: Date.now() - 6*60*1000 },
  { id: "BITCH-021", name: "Caramel Overload",     stock: 63,  threshold: 10, lastUpdated: Date.now() - 8*24*60*60*1000 },
  { id: "FOOD-001",  name: "Cheese Bread",         stock: 0,   threshold: 10, lastUpdated: Date.now() - 6*60*1000 },
];

const LOW_STOCK_THRESHOLD = 10;
let activeFilter = "all"; // "all" | "low" | "in"


// ============================================================
// HELPERS
// ============================================================

function getStatus(stock, threshold) {
  const t = threshold ?? LOW_STOCK_THRESHOLD;
  if (stock === 0)       return { statusText: "Low Stock",  statusClass: "out", isDanger: true  };
  if (stock < t)         return { statusText: "Low Stock",  statusClass: "low", isDanger: true  };
  return                        { statusText: "In Stock",   statusClass: "",    isDanger: false };
}

function formatTimeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)                 return `${diff} seconds ago`;
  if (diff < 3600)               return `${Math.floor(diff/60)} minutes ago`;
  if (diff < 86400)              return `${Math.floor(diff/3600)} hours ago`;
  return `${Math.floor(diff/86400)} days ago`;
}

function formatDateExact(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
       + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function updateStock(index, value) {
  inventoryData[index].stock = value;
  inventoryData[index].lastUpdated = Date.now();
}

function getFilteredData() {
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  let data = inventoryData;

  if (activeFilter === "low") {
    data = data.filter(i => i.stock < (i.threshold ?? LOW_STOCK_THRESHOLD));
  } else if (activeFilter === "in") {
    data = data.filter(i => i.stock >= (i.threshold ?? LOW_STOCK_THRESHOLD));
  }

  if (q) {
    data = data.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }

  return data;
}

function confirmLogout() {
  window.location.href = "login.html";
}


// ============================================================
// ALERT
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


// ============================================================
// RENDER TABLE
// ============================================================

function renderTable(data) {
  const tbody = document.getElementById("inventoryTable");

  tbody.innerHTML = data.map(item => {
    const { statusText, statusClass, isDanger } = getStatus(item.stock, item.threshold);
    const realIndex = inventoryData.indexOf(item);
    const t = item.threshold ?? LOW_STOCK_THRESHOLD;

    return `
      <tr class="${isDanger ? "row-danger" : ""}" data-index="${realIndex}">
        <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);font-size:11px">${item.id}</small></td>
        <td>
          <span class="status ${statusClass}">
            <span class="status-dot"></span>${statusText}
          </span>
        </td>
        <td class="stock"><span class="stock-num">${item.stock}</span></td>
        <td>
          <div class="last-updated">
            <span class="time-ago">
              <i data-lucide="clock" style="width:13px;height:13px;opacity:0.5"></i>
              ${formatTimeAgo(item.lastUpdated)}
            </span>
            <span class="date-exact">${formatDateExact(item.lastUpdated)}</span>
          </div>
        </td>
        <td>
          <div class="update-wrapper">
            <input type="number" class="update-input" value="${item.stock}" min="0" />
            <button class="update-btn" title="Save">
              <i data-lucide="save"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  bindUpdateButtons();
  if (window.lucide) lucide.createIcons();
}


// ============================================================
// STATS + FILTER TABS
// ============================================================

function updateStats() {
  const allCount  = inventoryData.length;
  const lowCount  = inventoryData.filter(i => i.stock < (i.threshold ?? LOW_STOCK_THRESHOLD)).length;
  const inCount   = allCount - lowCount;
  const totalUnits = inventoryData.reduce((s, i) => s + i.stock, 0);

  // stat cards
  document.getElementById("statTotalProducts").textContent = allCount;
  document.getElementById("statLowStock").textContent      = lowCount;
  document.getElementById("statTotalUnits").textContent    = totalUnits.toLocaleString();

  // danger card
  const lowCard = document.getElementById("lowStockCard");
  lowCard.classList.toggle("stat-danger", lowCount > 0);

  // filter tab labels
  document.getElementById("tabAll").textContent      = `All (${allCount})`;
  document.getElementById("tabLow").textContent      = `Low Stock (${lowCount})`;
  document.getElementById("tabIn").textContent       = `In Stock (${inCount})`;

  if (window.lucide) lucide.createIcons();
}

function setFilter(filter) {
  activeFilter = filter;

  // clear all active classes
  ["tabAll","tabLow","tabIn"].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove("active","active-low","active-in");
  });

  if (filter === "all") document.getElementById("tabAll").classList.add("active");
  if (filter === "low") document.getElementById("tabLow").classList.add("active-low");
  if (filter === "in")  document.getElementById("tabIn").classList.add("active-in");

  renderTable(getFilteredData());
  if (window.lucide) lucide.createIcons();
}


// ============================================================
// MODALS
// ============================================================

function openModal(id)  { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }


// ============================================================
// EVENT LISTENERS
// ============================================================

function bindUpdateButtons() {
  const tbody = document.getElementById("inventoryTable");

  tbody.querySelectorAll(".update-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const row   = btn.closest("tr");
      const idx   = parseInt(row.dataset.index);
      const input = row.querySelector(".update-input");
      const val   = parseInt(input.value);

      if (input.value === "") {
        showAlert("Please enter a quantity.");
        return;
      }
      if (isNaN(val) || val < 0) {
        showAlert("Stock cannot be negative!");
        input.value = "";
        return;
      }

      updateStock(idx, val);
      renderTable(getFilteredData());
      updateStats();
      if (window.lucide) lucide.createIcons();
    });
  });
}

document.getElementById("searchInput")?.addEventListener("input", () => {
  renderTable(getFilteredData());
  if (window.lucide) lucide.createIcons();
});


// ============================================================
// INIT
// ============================================================

renderTable(inventoryData);
updateStats();
setFilter("all");

