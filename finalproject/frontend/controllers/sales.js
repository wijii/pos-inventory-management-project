// State Variables: Keeps track of charts and the currently active time period for fetching.
let activePeriod = "daily";
let revChart     = null;
let transChart   = null;

const PERIOD_SUB_LABELS = {
  daily:   "Last 14 days",
  weekly:  "Last 12 weeks",
  monthly: "Last 12 months",
};


// Logic & Utilities: Formats currencies and determines chart peaks.
function formatCurrency(value) {
  return "₱" + parseFloat(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPeakLabel(labels, values) {
  if (!labels.length) return "—";
  return labels[values.indexOf(Math.max(...values))];
}

function confirmLogout() {
  authAjax.logout(
    function() { window.location.href = "login.html"; },
    function() { window.location.href = "login.html"; }
  );
}


// UI Renderers: Fetches data via AJAX and populates the data tables or chart instances.
function renderLifetimeStats() {
  salesAjax.getLifetimeStats(
    function (data) {
      document.getElementById("total-revenue").textContent = formatCurrency(data.totalRevenue);
      document.getElementById("total-trans").textContent   = data.totalTransactions.toLocaleString();
      document.getElementById("avg-ticket").textContent    = formatCurrency(data.avgTicket);
    },
    function () {
      console.error("Failed to load lifetime stats.");
    }
  );
}

function renderCharts() {
  salesAjax.getChartData(
    activePeriod,
    function (data) {
      const labels  = data.labels  || [];
      const revenue = data.revenue || [];
      const trans   = data.transactions || [];

      //update period stats above the chart
      const periodRevTotal = revenue.reduce((a, b) => a + b, 0);
      document.getElementById("period-revenue").textContent = formatCurrency(periodRevTotal);
      document.getElementById("peak-label").textContent     = getPeakLabel(labels, revenue);
      document.getElementById("rev-sub").textContent        = PERIOD_SUB_LABELS[activePeriod];

      const commonOptions = {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { displayColors: false },
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "rgba(252,250,248,0.5)" } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "rgba(252,250,248,0.5)" } },
        },
      };

      if (revChart)   revChart.destroy();
      if (transChart) transChart.destroy();

      revChart = new Chart(document.getElementById("revenueChart"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            data:            revenue,
            borderColor:     "#d9840d",
            backgroundColor: "rgba(217,132,13,0.1)",
            fill:            true,
            tension:         0.4,
          }],
        },
        options: commonOptions,
      });

      transChart = new Chart(document.getElementById("transactionChart"), {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            data:            trans,
            backgroundColor: "#d9840d",
            borderRadius:    5,
          }],
        },
        options: commonOptions,
      });
    },
    function () {
      console.error("Failed to load chart data.");
    }
  );
}

function renderProductTable() {
  const tbody = document.getElementById("product-table-body");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;opacity:0.4;'>Loading...</td></tr>";

  salesAjax.getProductBreakdown(
    function (products) {
      if (!products || products.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;opacity:0.4;'>No data yet.</td></tr>";
        return;
      }

      tbody.innerHTML = products.map(function (prod, i) {
        return `<tr>
          <td style="opacity:0.5">${i + 1}</td>
          <td>${prod.name}</td>
          <td>${prod.sold.toLocaleString()}</td>
          <td class="text-orange">${formatCurrency(prod.revenue)}</td>
        </tr>`;
      }).join("");
    },
    function () {
      tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;color:#ef4444;'>Failed to load data.</td></tr>";
    }
  );
}

function renderTransactionTable() {
  const tbody = document.getElementById("transactions-table-body");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;opacity:0.4;'>Loading...</td></tr>";

  salesAjax.getTransactionHistory(
    function (history) {
      if (!history || history.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;opacity:0.4;'>No transactions yet.</td></tr>";
        return;
      }

      tbody.innerHTML = history.map(function (row) {
        return `<tr>
          <td style="font-size:12px;opacity:0.8;">RCP-${row.transactionID}</td>
          <td>${row.itemCount} Item${row.itemCount !== 1 ? "s" : ""}</td>
          <td>${row.cashier}</td>
          <td class="text-orange">${formatCurrency(row.total)}</td>
          <td>
            <div style="font-size:13px;">${row.date}</div>
            <div style="font-size:11px;opacity:0.5;">${row.time}</div>
          </td>
          <td><button class="btn-view" onclick="viewReceipt(${row.transactionID}, '${row.cashier}', '${row.date}', '${row.time}', ${row.total}, ${row.amountPaid})">View</button></td>
        </tr>`;
      }).join("");
    },
    function () {
      tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#ef4444;'>Failed to load data.</td></tr>";
    }
  );
}


// Modal Logic: Handles popovers such as viewing the receipt details table.
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function viewReceipt(transactionID, cashier, date, time, total, amountPaid) {
  //populate the header fields immediately
  document.getElementById("m-receipt-id").textContent = "#RCP-" + transactionID;
  document.getElementById("m-date").textContent        = date;
  document.getElementById("m-time").textContent        = time;
  document.getElementById("m-cashier").textContent     = cashier;
  document.getElementById("m-items-list").innerHTML    = "<p style='opacity:0.4;text-align:center;'>Loading items...</p>";
  document.getElementById("m-total").textContent       = formatCurrency(total);

  document.getElementById("receipt-modal").classList.add("active");
  lucide.createIcons();

  //fetch the actual line items for this transaction
  salesAjax.getReceiptItems(
    transactionID,
    function (items) {
      if (!items || items.length === 0) {
        document.getElementById("m-items-list").innerHTML = "<p style='opacity:0.4;text-align:center;'>No items found.</p>";
        return;
      }

      const subtotal = items.reduce(function (sum, item) { return sum + item.subtotal; }, 0);
      const change   = amountPaid - total;

      document.getElementById("m-items-list").innerHTML = items.map(function (item) {
        return `<div class="receipt-item">
          <div class="item-info">
            <h5>${item.name} <span style="opacity:0.5">× ${item.qty}</span></h5>
            <p>${formatCurrency(item.price)} each</p>
          </div>
          <div class="item-price">${formatCurrency(item.subtotal)}</div>
        </div>`;
      }).join("");

      document.getElementById("m-subtotal").textContent = formatCurrency(subtotal);
      document.getElementById("m-total").textContent    = formatCurrency(total);
      lucide.createIcons();
    },
    function () {
      document.getElementById("m-items-list").innerHTML = "<p style='color:#ef4444;text-align:center;'>Failed to load items.</p>";
    }
  );
}

function closeReceiptModal() {
  document.getElementById("receipt-modal").classList.remove("active");
}


// DOM Event Tracking: Attaches tab switching and dropdown button actions to their respective functions.
document.querySelectorAll(".filter-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    activePeriod = btn.dataset.period;
    renderCharts();
  });
});

document.querySelectorAll(".tab-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");

    const targetTab = btn.dataset.tab;
    document.querySelectorAll(".tab-pane").forEach(function (p) { p.classList.remove("active"); });
    document.getElementById(targetTab).classList.add("active");

    if (targetTab === "sales-date")    renderCharts();
    if (targetTab === "product-sales") renderProductTable();
    if (targetTab === "transactions")  renderTransactionTable();
  });
});

//close modals when clicking outside the card
window.onclick = function (e) {
  const modal = document.getElementById("receipt-modal");
  if (e.target === modal) closeReceiptModal();
};


// Startup Initialization: Triggers initial widget loads when the dashboard mounts.
$(document).ready(function () {
  renderLifetimeStats();
  renderCharts();
  renderTransactionTable(); // pre-load the history table so it is ready when user clicks the tab
});
