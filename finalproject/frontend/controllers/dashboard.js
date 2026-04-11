// State Management: Tracks the active filter period and the currently rendered chart instance.

let activePeriod       = "daily";
let salesChartInstance = null;


// Helpers & Formatting Logic: Handles styling, percentage calculations, and currency formatting.

function getLowStockStyle(lowStock) {
  if (lowStock > 0) {
    return {
      background:  "rgba(239,68,68,0.15)",
      borderColor: "rgba(239,68,68,0.4)",
      color:       "#ef4444",
      danger:      true,
    };
  }
  return {
    background:  "rgba(0,201,80,0.15)",
    borderColor: "rgba(0,201,80,0.4)",
    color:       "#00c950",
    danger:      false,
  };
}

function getBarPct(amount, maxAmount) {
  if (maxAmount === 0) return 0;
  return Math.round((amount / maxAmount) * 100);
}

function formatCurrency(value) {
  return "₱" + parseFloat(value).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getPeriodLabel(period) {
  if (period === "daily")   return "Today";
  if (period === "weekly")  return "This Week";
  if (period === "monthly") return "This Month";
  return "";
}


// UI Renderers: Updates the dashboard cards, charts, and lists using data fetched from the API.

function updateStatCards(data) {
  document.getElementById("sales").textContent        = formatCurrency(data.sales);
  document.getElementById("transactions").textContent = data.transactions;
  document.getElementById("avg").textContent          = formatCurrency(data.avg);
  document.getElementById("lowStock").textContent     = data.lowStock;
  document.getElementById("salesSub").textContent     = getPeriodLabel(data.period);

  const lowStockCard = document.getElementById("lowStockCard");
  const badge        = lowStockCard.querySelector(".card-badge");
  const style        = getLowStockStyle(data.lowStock);

  lowStockCard.classList.toggle("danger", style.danger);
  badge.style.background  = style.background;
  badge.style.borderColor = style.borderColor;
  badge.style.color       = style.color;
}

function updateChartHeader(data) {
  document.getElementById("chartTitle").textContent = "Revenue Overview";
  document.getElementById("chartSub").textContent   = getPeriodLabel(data.period) + " Breakdown";
  document.getElementById("chartBadge").textContent = formatCurrency(data.sales);
}

function updateChart(data) {
  const ctx = document.getElementById("salesChart").getContext("2d");
  if (salesChartInstance) salesChartInstance.destroy();

  salesChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.chartLabels,
      datasets: [{
        data:            data.chartValues,
        backgroundColor: "#d9840d",
        borderColor:     "#d9840d",
        borderWidth:     1.5,
        borderRadius:    5,
        borderSkipped:   false,
        barPercentage:   1.2,
        categoryPercentage: 0.5,
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors:   false,
          backgroundColor: "#1e1917",
          borderColor:     "#453f3a",
          borderWidth:     1.5,
          titleColor:      "#fcfaf8",
          bodyColor:       "#d9840d",
          padding:         10,
          callbacks: {
            label: ctx => " Sales: ₱" + ctx.raw.toLocaleString()
          }
        }
      },
      scales: {
        x: {
          grid:   { color: "rgba(255,255,255,0.04)" },
          ticks:  { color: "rgba(252,250,248,0.45)", font: { size: 11 } },
          border: { color: "transparent" }
        },
        y: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(252,250,248,0.45)",
            font:  { size: 11 },
            callback: v => v === 0 ? "₱0" : "₱" + (v / 1000).toFixed(1) + "k"
          },
          border: { color: "transparent" }
        }
      }
    }
  });
}

function updateTopProducts(topProducts) {
  const list = document.getElementById("topProductsList");

  if (!topProducts || topProducts.length === 0) {
    list.innerHTML = "<div style='text-align:center;opacity:0.4;padding:20px;font-size:13px;'>No sales recorded for this period.</div>";
    return;
  }

  const maxAmt = Math.max(...topProducts.map(p => p.amount));

  list.innerHTML = topProducts.map(p => `
    <div class="product">
      <span class="product-name">${p.name}</span>
      <span class="product-amount">${formatCurrency(p.amount)}</span>
      <span class="product-sold">${p.sold} Sold</span>
      <div class="product-bar-track">
        <div class="product-bar-fill" style="width:${getBarPct(p.amount, maxAmt)}%"></div>
      </div>
    </div>
  `).join("");
}

function showLoadingState() {
  document.getElementById("sales").textContent        = "Loading...";
  document.getElementById("transactions").textContent = "—";
  document.getElementById("avg").textContent          = "Loading...";
  document.getElementById("lowStock").textContent     = "—";
}

function animateElements() {
  document.querySelectorAll(".card, .chart-card, .quick-card, .top-products, .product").forEach(el => {
    el.classList.remove("animate");
    void el.offsetWidth;
    el.classList.add("animate");
  });
}


// Core Fetching Logic: Triggers the AJAX request to get new dashboard statistics.

function updateDashboard(period) {
  showLoadingState();

  dashboardAjax.getStats(
    period,
    function (data) {
      if (data.error) {
        console.error("Dashboard error from server:", data.error);
        return;
      }

      updateStatCards(data);
      updateChartHeader(data);
      updateChart(data);
      updateTopProducts(data.topProducts);
      animateElements();
      if (window.lucide) lucide.createIcons();
    },
    function (xhr, status, err) {
      console.error("Failed to load dashboard data:", status, err);
    }
  );
}


// Modal Controllers: Controls the opening and closing of floating popup modals.

function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}




// Initializer: Attaches click logic to filter tabs and starts the initial data load on startup.

$(document).ready(function () {
  updateDashboard(activePeriod);

  // Silent Auto-Backup: Pings the backup controller in the background once per day.
  // The PHP script checks if a backup already ran today, so it never duplicates files.
  fetch("../../backend/routes.php?action=runAutoBackup").catch(() => {});

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePeriod = btn.dataset.period;
      updateDashboard(activePeriod);
    });
  });
});
