// ============================================================
// DATA
// ============================================================

const products = [
  { id: "BITCH-051", name: "Dark Choco Macchiato", price: 0.01, stock: 11, category: "beverages", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80" },
  { id: "BITCH-201", name: "Matcha Overload",      price: 0.01, stock: 11, category: "beverages", img: "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&q=80" },
  { id: "BITCH-501", name: "Mango Overload",       price: 0.01, stock: 11, category: "beverages", img: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80" },
  { id: "BITCH-301", name: "Caramel Chocolate",    price: 0.01, stock: 11, category: "beverages", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80" },
  { id: "BITCH-021", name: "Caramel Overload",     price: 0.01, stock: 11, category: "beverages", img: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80" },
  { id: "FOOD-001",  name: "Cheese Bread",         price: 0.01, stock: 8,  category: "food",      img: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&q=80" },
  { id: "FOOD-002",  name: "Egg Sandwich",         price: 0.01, stock: 5,  category: "food",      img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80" },
  { id: "FOOD-003",  name: "Club Sandwich",        price: 0.01, stock: 0,  category: "food",      img: "https://images.unsplash.com/photo-1539252554873-d71e8d8c9f18?w=400&q=80" },
];

const SIZE_OPTIONS = [
  { key: "small",  label: "Small",  badge: "S", sub: "Base size",     multiplier: 1.00 },
  { key: "medium", label: "Medium", badge: "M", sub: "×1.25 of base", multiplier: 1.25 },
  { key: "large",  label: "Large",  badge: "L", sub: "×1.5 of base",  multiplier: 1.50 },
];

const DISCOUNTS = {
  none:   { label: "None",         rate: 0,    color: "" },
  senior: { label: "Senior (20%)", rate: 0.20, color: "#00c950" },
  pwd:    { label: "PWD (20%)",    rate: 0.20, color: "#60a5fa" },
};

const TAX_RATE = 0.12;

// ============================================================
// STATE
// ============================================================

let cart = [];
let activeCategory = "all";
let searchQuery = "";
let activeDiscount = "none";
let activePayment = "cash";

// ============================================================
// LOGIC
// ============================================================

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function fmt(val) {
  return "₱" + val.toFixed(2);
}

function fmtShort(val) {
  return val % 1 === 0 ? "₱" + val.toFixed(0) : "₱" + val.toFixed(2);
}

function getSubtotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function getDiscountAmount(subtotal) {
  return subtotal * DISCOUNTS[activeDiscount].rate;
}

function getTotal() {
  const sub      = getSubtotal();
  const discount = getDiscountAmount(sub);
  const taxable  = sub - discount;
  return taxable * (1 + TAX_RATE);
}

function getTax() {
  const sub      = getSubtotal();
  const discount = getDiscountAmount(sub);
  const taxable  = sub - discount;
  return taxable * TAX_RATE;
}

function generateReceiptId() {
  return "RCP-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getTotalItemCount() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock === 0) return;
  const existing = cart.find(c => c.id === productId);
  if (existing) {
    if (existing.qty < product.stock) existing.qty++;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(c => c.id !== productId);
  renderCart();
}

function changeQty(productId, delta) {
  const item = cart.find(c => c.id === productId);
  if (!item) return;
  const baseId  = productId.replace(/-(small|medium|large)$/, "");
  const product = products.find(p => p.id === baseId);
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== productId);
  } else if (product && item.qty > product.stock) {
    item.qty = product.stock;
  }
  renderCart();
}

function pickSize(productId, sizeKey) {
  const product = products.find(p => p.id === productId);
  const size    = SIZE_OPTIONS.find(s => s.key === sizeKey);
  if (!product || !size) return;
  const finalPrice = parseFloat((product.price * size.multiplier).toFixed(2));
  const cartId     = `${productId}-${sizeKey}`;
  const cartName   = `${product.name} (${size.label})`;
  const existing   = cart.find(c => c.id === cartId);
  if (existing) {
    if (existing.qty < product.stock) existing.qty++;
  } else {
    cart.push({ id: cartId, name: cartName, price: finalPrice, qty: 1 });
  }
  closeSizePicker();
  renderCart();
}

function clearCart() {
  cart = [];
  const cashInput = document.getElementById("cashInput");
  if (cashInput) cashInput.value = "";
  const changeEl = document.getElementById("change");
  if (changeEl) changeEl.textContent = "₱0.00";
  renderCart();
  updateTotals();
}

function confirmLogout() { window.location.href = "login.html"; }
function printReceipt()  { window.print(); }

// ============================================================
// UI / RENDERING
// ============================================================

function renderProducts() {
  const grid     = document.getElementById("productGrid");
  const filtered = products.filter(p => {
    const matchCat    = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;opacity:0.35;padding:40px;font-size:13px;">No products found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card ${p.stock === 0 ? "out-of-stock" : ""}"
         onclick="${p.stock > 0 ? (p.category === "beverages" ? `openSizePicker('${p.id}')` : `addToCart('${p.id}')`) : ""}">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        <span class="product-badge">${capitalize(p.category)}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-id">${p.id}</div>
      </div>
      <div class="product-footer">
        <span class="product-price">${fmt(p.price)}</span>
        <span class="product-stock">${p.stock === 0 ? "Out of Stock" : "Stock " + p.stock}</span>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const emptyEl   = document.getElementById("cartEmpty");
  const countBadge = document.getElementById("cartCountBadge");

  const totalItems = getTotalItemCount();
  countBadge.textContent = totalItems + (totalItems === 1 ? " item" : " items");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state" id="cartEmpty">
        <svg class="empty-box-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 10L68 24V56L40 70L12 56V24L40 10Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M40 10V70" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/>
          <path d="M12 24L40 38L68 24" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M26 17L54 31" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
        </svg>
        <span>Cart is empty</span>
      </div>`;
    updateTotals();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <div class="cart-item-top">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-unit">${fmt(item.price)}</div>
        </div>
        <button class="cart-delete" onclick="removeFromCart('${item.id}')">
          <i data-lucide="trash-2" stroke="currentColor" style="width:14px;height:14px;"></i>
        </button>
      </div>
      <div class="cart-item-bottom">
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <div class="cart-item-subtotal">${fmt(item.price * item.qty)}</div>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
  updateTotals();
}

function updateTotals() {
  const sub      = getSubtotal();
  const discount = getDiscountAmount(sub);
  const tax      = getTax();
  const total    = getTotal();
  const d        = DISCOUNTS[activeDiscount];

  document.getElementById("subtotal").textContent = fmtShort(sub);
  document.getElementById("tax").textContent      = fmtShort(tax);
  document.getElementById("total").textContent    = fmtShort(total);

  // Discount row
  const discountRow    = document.getElementById("discountRow");
  const discountLabel  = document.getElementById("discountLabel");
  const discountAmount = document.getElementById("discountAmount");
  const discountApplied = document.getElementById("discountApplied");
  const discountAppliedText = document.getElementById("discountAppliedText");

  if (activeDiscount !== "none") {
    discountRow.style.display = "";
    discountLabel.textContent  = d.label;
    discountLabel.style.color  = d.color;
    discountAmount.textContent = "-" + fmtShort(discount);
    discountAmount.style.color = d.color;

    discountApplied.style.display = "";
    discountApplied.style.color   = d.color;
    discountAppliedText.textContent = `${d.label} applied — saving ${fmtShort(discount)}`;
  } else {
    discountRow.style.display    = "none";
    discountApplied.style.display = "none";
  }

  updateChange();
}

function updateChange() {
  const cashInput = document.getElementById("cashInput");
  const changeEl  = document.getElementById("change");
  const payBtn    = document.getElementById("payBtn");

  if (activePayment === "cash") {
    const cash   = parseFloat(cashInput?.value) || 0;
    const change = cash - getTotal();
    if (changeEl) changeEl.textContent = fmt(Math.max(0, change));
    if (payBtn) payBtn.disabled = !(cart.length > 0 && cash >= getTotal() && getTotal() > 0);
  } else {
    // GCash — no cash input needed
    if (payBtn) payBtn.disabled = !(cart.length > 0 && getTotal() > 0);
  }
}

// ============================================================
// MODALS
// ============================================================

function openModal(id)  { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function openSizePicker(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const overlay = document.getElementById("sizeModal");
  overlay.querySelector(".size-modal-thumb").src = product.img;
  overlay.querySelector(".size-modal-title h4").textContent = product.name;
  const optionsEl = overlay.querySelector(".size-options");
  optionsEl.innerHTML = SIZE_OPTIONS.map(s => {
    const price    = product.price * s.multiplier;
    const showOrig = s.multiplier > 1;
    return `
      <div class="size-option" onclick="pickSize('${productId}', '${s.key}')">
        <div class="size-badge">${s.badge}</div>
        <div class="size-info">
          <div class="size-name">${s.label}</div>
          <div class="size-sub">${s.sub}</div>
        </div>
        <div class="size-price-wrap">
          <div class="size-price-main">${fmt(price)}</div>
          ${showOrig ? `<div class="size-price-orig">${fmt(product.price)}</div>` : ""}
        </div>
      </div>`;
  }).join("");
  overlay.classList.add("show");
}

function closeSizePicker() {
  document.getElementById("sizeModal").classList.remove("show");
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// Cash input
document.getElementById("cashInput")?.addEventListener("input", () => updateChange());

// Pay button
document.getElementById("payBtn").addEventListener("click", () => {
  const cash      = activePayment === "cash" ? (parseFloat(document.getElementById("cashInput").value) || 0) : getTotal();
  const total     = getTotal();
  const change    = activePayment === "cash" ? cash - total : 0;
  const itemCount = getTotalItemCount();

  document.getElementById("modalItems").innerHTML = cart.map(item => `
    <div class="modal-item-row">
      <div class="modal-item-left">
        <span>${item.name}</span>
        <span style="font-size:11px;opacity:0.5;margin-top:2px;">${item.qty}x</span>
      </div>
      <span class="modal-item-price orange">${fmt(item.price * item.qty)}</span>
    </div>
  `).join("");

  document.getElementById("modalTotal").textContent     = fmt(total);
  document.getElementById("modalItemCount").textContent = itemCount;
  document.getElementById("modalCash").textContent      = activePayment === "cash" ? fmt(cash) : "GCash";
  document.getElementById("modalChange").textContent    = activePayment === "cash" ? fmt(change) : "N/A";
  document.getElementById("confirmModal").classList.add("show");
});

document.getElementById("modalCancel").addEventListener("click", () => {
  document.getElementById("confirmModal").classList.remove("show");
});

document.getElementById("modalConfirm").addEventListener("click", () => {
  const total     = getTotal();
  const receiptId = generateReceiptId();
  document.getElementById("receiptId").textContent    = "Receipt " + receiptId;
  document.getElementById("receiptTotal").textContent = "Total: " + fmt(total);
  document.getElementById("receiptSection").style.display = "flex";
  cart = [];
  const cashInput = document.getElementById("cashInput");
  if (cashInput) cashInput.value = "";
  document.getElementById("confirmModal").classList.remove("show");
  renderCart();
  lucide.createIcons();
});

document.getElementById("clearCartBtn")?.addEventListener("click", () => {
  if (cart.length === 0) return;
  document.getElementById("clearCartModal").classList.add("show");
});

document.getElementById("clearCartCancel").addEventListener("click", () => {
  document.getElementById("clearCartModal").classList.remove("show");
});

document.getElementById("clearCartConfirm").addEventListener("click", () => {
  clearCart();
  document.getElementById("clearCartModal").classList.remove("show");
});

// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.cat;
    renderProducts();
  });
});

// Search
document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderProducts();
});

// Discount buttons
document.querySelectorAll(".discount-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".discount-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeDiscount = btn.dataset.discount;

    // Update active button color based on discount type
    const d = DISCOUNTS[activeDiscount];
    document.querySelectorAll(".discount-btn").forEach(b => {
      b.style.borderColor = "";
      b.style.color       = "";
      b.style.background  = "";
    });
    if (activeDiscount !== "none") {
      btn.style.borderColor = d.color;
      btn.style.color       = d.color;
      btn.style.background  = d.color + "18";
    }

    updateTotals();
    lucide.createIcons();
  });
});

// Payment method buttons
document.querySelectorAll(".payment-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".payment-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activePayment = btn.dataset.method;

    const cashSection = document.getElementById("cashSection");
    const gcashInfo   = document.getElementById("gcashInfo");

    if (activePayment === "cash") {
      cashSection.style.display = "";
      gcashInfo.style.display   = "none";
    } else {
      cashSection.style.display = "none";
      gcashInfo.style.display   = "";
    }

    updateChange();
    lucide.createIcons();
  });
});

// Close modals on outside click
window.onclick = function(e) {
  document.querySelectorAll(".modal-overlay, .size-modal-overlay").forEach(modal => {
    if (e.target === modal) modal.classList.remove("show");
  });
};

// ============================================================
// INIT
// ============================================================

renderProducts();
renderCart();

