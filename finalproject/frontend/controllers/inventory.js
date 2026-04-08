// ============================================================
// DATA
// ============================================================

let inventoryData = [];

const LOW_STOCK_THRESHOLD = 5;
let activeFilter = "all"; // "all" | "low" | "in" | "logs"

// ============================================================
// HELPERS
// ============================================================

function getStatus(stock, threshold) {
  const t = threshold ?? LOW_STOCK_THRESHOLD;
  if (stock === 0)
    return { statusText: "Low Stock", statusClass: "out", isDanger: true };
  if (stock < t)
    return { statusText: "Low Stock", statusClass: "low", isDanger: true };
  return { statusText: "In Stock", statusClass: "", isDanger: false };
}

function formatTimeAgo(ts) {
  let diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 0) diff = 0;

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function formatDateExact(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function getFilteredData() {
  const q = (document.getElementById("searchInput")?.value || "")
    .toLowerCase()
    .trim();
  let data = inventoryData;

  if (activeFilter === "low") {
    data = data.filter((i) => i.stock < (i.threshold ?? LOW_STOCK_THRESHOLD));
  } else if (activeFilter === "in") {
    data = data.filter((i) => i.stock >= (i.threshold ?? LOW_STOCK_THRESHOLD));
  }

  if (q) {
    data = data.filter(
      (i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q),
    );
  }

  return data;
}

function confirmLogout() {
  window.location.href = "login.html";
}

// ============================================================
// ALERT
// ============================================================

function showAlert(message, isSuccess = true) {
  const alertsContainer = document.getElementById("alertsContainer");
  if (!alertsContainer) return;

  const alertBox = document.createElement("div");
  alertBox.classList.add("alerts");

  if (isSuccess) {
    alertBox.classList.add("success");
  }

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

  tbody.innerHTML = data
    .map((item) => {
      const { statusText, statusClass, isDanger } = getStatus(
        item.stock,
        item.threshold,
      );
      const realIndex = inventoryData.indexOf(item);

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
    })
    .join("");

  bindUpdateButtons();
  if (window.lucide) lucide.createIcons();
}
//audit logs table

function renderLogsTable() {
  const tbody = document.getElementById("inventoryTable");
  tbody.innerHTML =
    "<tr><td colspan='5' style='text-align:center;opacity:0.4;'>Loading audit logs...</td></tr>";

  inventoryAjax.getLogs(
    function (logs) {
      if (!logs || logs.length === 0) {
        tbody.innerHTML =
          "<tr><td colspan='5' style='text-align:center;opacity:0.4;'>No audit entries yet. Restock an item to create a log.</td></tr>";
        return;
      }

      //temporarily swap to 5-column log headers
      document
        .querySelector("#inventoryTable")
        .closest("table")
        .querySelector("thead tr").innerHTML = `
        <th>Item</th>
        <th>Change</th>
        <th style="text-align:center">Before → After</th>
        <th>Note</th>
        <th>By / When</th>
      `;

      tbody.innerHTML = logs
        .map(function (log) {
          const isPositive = log.quantityChange >= 0;
          const sign = isPositive ? "+" : "";
          const changeColor = isPositive ? "#00c950" : "#ef4444";
          const badgeClass =
            log.changeType === "restock" ? "status" : "status low";

          return `<tr>
          <td>
            <strong>${log.itemName}</strong><br>
            <small style="opacity:0.5;font-size:11px;">${log.skuCode}</small>
          </td>
          <td>
            <span class="${badgeClass}">
              <span class="status-dot"></span>${log.changeType}
            </span>
          </td>
          <td style="text-align:center;">
            ${log.quantityBefore}
            <span style="opacity:0.4;"> → </span>
            <strong style="color:${changeColor};">${log.quantityAfter}</strong>
            <span style="color:${changeColor};font-size:12px;"> (${sign}${log.quantityChange})</span>
          </td>
          <td style="font-size:12px;opacity:0.7;">${log.note || "—"}</td>
          <td>
            <div style="font-size:13px;">${log.changedBy}</div>
            <div style="font-size:11px;opacity:0.5;">${log.logTime}</div>
          </td>
        </tr>`;
        })
        .join("");

      if (window.lucide) lucide.createIcons();
    },
    function () {
      tbody.innerHTML =
        "<tr><td colspan='5' style='text-align:center;color:#ef4444;'>Failed to load logs.</td></tr>";
    },
  );
}

function resetTableHeaders() {
  document
    .querySelector("#inventoryTable")
    .closest("table")
    .querySelector("thead tr").innerHTML = `
    <th>Product Name</th>
    <th>Status</th>
    <th style="text-align:center">Current Stock</th>
    <th>Last Updated</th>
    <th style="text-align:right">Update Stock</th>
  `;
}

// ============================================================
// STATS + FILTER TABS
// ============================================================

function updateStats() {
  const allCount = inventoryData.length;
  const lowCount = inventoryData.filter(
    (i) => i.stock < (i.threshold ?? LOW_STOCK_THRESHOLD),
  ).length;
  const inCount = allCount - lowCount;
  const totalUnits = inventoryData.reduce((s, i) => s + i.stock, 0);

  document.getElementById("statTotalProducts").textContent = allCount;
  document.getElementById("statLowStock").textContent = lowCount;
  document.getElementById("statTotalUnits").textContent =
    totalUnits.toLocaleString();

  const lowCard = document.getElementById("lowStockCard");
  lowCard.classList.toggle("stat-danger", lowCount > 0);

  document.getElementById("tabAll").textContent = `All (${allCount})`;
  document.getElementById("tabLow").textContent = `Low Stock (${lowCount})`;
  document.getElementById("tabIn").textContent = `In Stock (${inCount})`;
  document.getElementById("tabLogs").textContent = `Audit Logs`;

  if (window.lucide) lucide.createIcons();
}

function setFilter(filter) {
  activeFilter = filter;

  ["tabAll", "tabLow", "tabIn", "tabLogs"].forEach((id) => {
    const el = document.getElementById(id);
    el.classList.remove("active", "active-low", "active-in", "active-logs");
  });

  if (filter === "all")
    document.getElementById("tabAll").classList.add("active");
  if (filter === "low")
    document.getElementById("tabLow").classList.add("active-low");
  if (filter === "in")
    document.getElementById("tabIn").classList.add("active-in");
  if (filter === "logs")
    document.getElementById("tabLogs").classList.add("active");

  if (filter === "logs") {
    resetTableHeaders();
    renderLogsTable();
  } else {
    resetTableHeaders();
    renderTable(getFilteredData());
    if (window.lucide) lucide.createIcons();
  }
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

// ============================================================
// EVENT LISTENERS
// ============================================================

function bindUpdateButtons() {
  const tbody = document.getElementById("inventoryTable");

  tbody.querySelectorAll(".update-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      const idx = parseInt(row.dataset.index);
      const input = row.querySelector(".update-input");
      const val = parseInt(input.value);

      if (input.value === "") {
        showAlert("Please enter a quantity.", false);
        return;
      }
      if (isNaN(val) || val < 0) {
        showAlert("Stock cannot be negative!", false);
        input.value = "";
        return;
      }

      const item = inventoryData[idx];
      inventoryAjax.updateStock(
        item.id,
        val,
        function (response) {
          if (response.trim() === "Success") {
            item.stock = val;
            item.lastUpdated = Date.now();
            showAlert(`Updated stock for ${item.name}!`, true);
            renderTable(getFilteredData());
            updateStats();
          } else {
            showAlert("Failed to update stock: " + response, false);
          }
        },
        function () {
          showAlert("Network error during update.", false);
        },
      );
    });
  });
}

document.getElementById("searchInput")?.addEventListener("input", () => {
  if (activeFilter !== "logs") {
    renderTable(getFilteredData());
    if (window.lucide) lucide.createIcons();
  }
});

$(document).ready(function () {
  inventoryAjax.getInventory(
    function (data) {
      inventoryData = data || [];
      renderTable(getFilteredData());
      updateStats();
      setFilter("all");
    },
    function () {
      showAlert("Failed to load inventory data from DB.", false);
    },
  );
});
