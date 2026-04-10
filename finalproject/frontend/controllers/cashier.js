// ============================================================
// DATA
// ============================================================

let products = [];

const SIZE_OPTIONS = [
  { key: "small",  label: "Small",  badge: "S", sub: "Base size",     multiplier: 1.00 },
  { key: "medium", label: "Medium", badge: "M", sub: "×1.25 of base", multiplier: 1.25 },
  { key: "large",  label: "Large",  badge: "L", sub: "×1.5 of base",  multiplier: 1.50 },
];

const TAX_RATE = 0.05;


// ============================================================
// STATE
// ============================================================

let cart           = [];
let activeCategory = "all";
let searchQuery    = "";


// ============================================================
// LOGIC
// ============================================================

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatPrice(val) {
  return "₱" + val.toFixed(2);
}

function getSubtotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function getTotal() {
  let total = getSubtotal() * (1 + TAX_RATE);
  if (document.getElementById("discountToggle") && document.getElementById("discountToggle").checked) {
    total = total * 0.8; // 20% discount
  }
  return total;
}

function generateReceiptId() {
  return "RCP-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
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
  const item    = cart.find(c => c.id === productId);
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

  const existing = cart.find(c => c.id === cartId);
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
  document.getElementById("cashInput").value    = "";
  document.getElementById("change").textContent = "₱0.00";
  if(document.getElementById("discountToggle")) document.getElementById("discountToggle").checked = false;
  if(document.getElementById("paymentMethod")) document.getElementById("paymentMethod").value = "Cash";
  document.getElementById("payBtn").disabled    = true;
  renderCart();
  updateTotals();
}

function printReceipt() {
  window.print();
}

function confirmLogout() {
  window.location.href = "login.html";
}


// ============================================================
// UI / RENDERING
// ============================================================

function renderProducts() {
  const grid     = document.getElementById("productGrid");
  const filtered = products.filter(p => {
    const matchCat    = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery) ||
                        p.id.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;opacity:0.35;padding:40px;font-size:13px;">No products found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card ${p.stock === 0 ? "out-of-stock" : ""}"
         onclick="${p.stock > 0
           ? (p.category === "beverages" ? `openSizePicker('${p.id}')` : `addToCart('${p.id}')`)
           : ""}">
      <div class="product-img-wrap">
        ${p.img
          ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
             <div class="product-img-placeholder" style="display:none;"><i data-lucide="image-off" style="width:32px;height:32px;opacity:0.25;"></i></div>`
          : `<div class="product-img-placeholder"><i data-lucide="image-off" style="width:32px;height:32px;opacity:0.25;"></i></div>`
        }
        <span class="product-badge">${capitalize(p.category)}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-id">${p.id}</div>
      </div>
      <div class="product-footer">
        <span class="product-price">${formatPrice(p.price)}</span>
        <span class="product-stock">${p.stock === 0 ? "Out of Stock" : "Stock " + p.stock}</span>
      </div>
    </div>
  `).join("");


  lucide.createIcons();
}

function renderCart() {
  const container = document.getElementById("cartItems");

  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty">No items yet.<br>Click a product to add.</div>`;
    updateTotals();
    updateClearButton();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <div class="cart-item-top">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-unit">${formatPrice(item.price)}</div>
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
        <div class="cart-item-subtotal">${formatPrice(item.price * item.qty)}</div>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
  updateTotals();
  updateClearButton();
}

function updateClearButton() {
  document.getElementById("clearCartBtn").style.display = cart.length === 0 ? "none" : "flex";
}

function updateTotals() {
  const subtotalVal = getSubtotal();
  const taxVal      = subtotalVal * TAX_RATE;
  let totalVal    = subtotalVal + taxVal;
  let discountVal = 0;

  if (document.getElementById("discountToggle") && document.getElementById("discountToggle").checked) {
      discountVal = totalVal * 0.2;
      totalVal = totalVal - discountVal;
  }

  document.getElementById("subtotal").textContent = formatPrice(subtotalVal);
  document.getElementById("tax").textContent      = formatPrice(taxVal);
  document.getElementById("total").textContent    = formatPrice(totalVal);


  updateChange(totalVal);
}

function updateChange(totalVal) {
  const cash   = parseFloat(document.getElementById("cashInput").value) || 0;
  const change = cash - (totalVal !== undefined ? totalVal : getTotal());
  document.getElementById("change").textContent = formatPrice(Math.max(0, change));

  document.getElementById("payBtn").disabled = !(cart.length > 0 && cash >= getTotal() && getTotal() > 0);
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

function openSizePicker(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const overlay = document.getElementById("sizeModal");
  overlay.querySelector(".size-modal-thumb").src            = product.img;
  overlay.querySelector(".size-modal-title h4").textContent = product.name;

  overlay.querySelector(".size-options").innerHTML = SIZE_OPTIONS.map(s => {
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
          <div class="size-price-main">${formatPrice(price)}</div>
          ${showOrig ? `<div class="size-price-orig">${formatPrice(product.price)}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  overlay.classList.add("show");
}

function closeSizePicker() {
  document.getElementById("sizeModal").classList.remove("show");
}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.getElementById("cashInput").addEventListener("input", () => updateChange());

document.getElementById("discountToggle").addEventListener("change", () => updateTotals());

document.getElementById("paymentMethod").addEventListener("change", (e) => {
    const isGCash = e.target.value === "GCash";
    const cashInput = document.getElementById("cashInput");
    if (isGCash) {
        cashInput.value = getTotal().toFixed(2);
        cashInput.readOnly = true;
    } else {
        cashInput.value = "";
        cashInput.readOnly = false;
    }
    updateChange();
});

document.getElementById("payBtn").addEventListener("click", () => {
  const cash      = parseFloat(document.getElementById("cashInput").value) || 0;
  const total     = getTotal();
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  document.getElementById("modalItems").innerHTML = cart.map(item => `
    <div class="modal-item-row">
      <div class="modal-item-left">
        <span class="modal-item-name">${item.name}</span>
        <span class="modal-item-qty" style="font-size:11px;opacity:0.5;margin-top:2px;">${item.qty}x</span>
      </div>
      <span class="modal-item-price orange">${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join("");

  document.getElementById("modalTotal").textContent     = formatPrice(total);
  document.getElementById("modalItemCount").textContent = itemCount;
  
  const paymentMethod = document.getElementById("paymentMethod").value;
  const isDiscounted = document.getElementById("discountToggle").checked;
  const discountAmount = isDiscounted ? ((getSubtotal() + (getSubtotal() * TAX_RATE)) * 0.2) : 0;
  
  document.getElementById("modalPaymentMode").textContent = paymentMethod;
  document.getElementById("modalDiscountAmount").textContent = formatPrice(discountAmount);
  
  document.getElementById("modalCash").textContent      = formatPrice(cash);
  document.getElementById("modalChange").textContent    = formatPrice(cash - total);

  document.getElementById("confirmModal").classList.add("show");
});

document.getElementById("modalCancel").addEventListener("click", () => {
  document.getElementById("confirmModal").classList.remove("show");
});

document.getElementById("modalConfirm").addEventListener("click", () => {
  const cash  = parseFloat(document.getElementById("cashInput").value) || 0;
  const total = getTotal();
  const paymentMethod = document.getElementById("paymentMethod").value;
  const discountAmount = document.getElementById("discountToggle").checked ? ((getSubtotal() + (getSubtotal() * TAX_RATE)) * 0.2) : 0;

  //send the cart to the backend to record the transaction and update inventory
  posAjax.checkout(
    cash,
    total,
    cart,
    paymentMethod,
    discountAmount,
    function (result) {
      if (result.startsWith("Success")) {
        //show the receipt with the transaction ID returned from the server
        const transactionID = result.split(":")[1];
        document.getElementById("receiptId").textContent        = "Receipt RCP-" + transactionID;
        document.getElementById("receiptTotal").textContent     = "Total: " + formatPrice(total);
        document.getElementById("receiptSection").style.display = "flex";

        //clear the cart after successful checkout
        cart = [];
        document.getElementById("cashInput").value = "";
        document.getElementById("confirmModal").classList.remove("show");
        renderCart();
        lucide.createIcons();
        
        // RE-LOAD PRODUCTS FROM DB to update the stock labels in the grid immediately
        loadProductsFromDB();
      } else {
        alert("Checkout Failed: " + result);
        document.getElementById("confirmModal").classList.remove("show");
      }
    },
    function () {
      alert("Network error during checkout. Please try again.");
      document.getElementById("confirmModal").classList.remove("show");
    }
  );
});

document.getElementById("clearCartBtn").addEventListener("click", () => {
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

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.cat;
    renderProducts();
  });
});

document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderProducts();
});

window.onclick = function (e) {
  document.querySelectorAll(".modal-overlay, .size-modal-overlay").forEach(modal => {
    if (e.target === modal) modal.classList.remove("show");
  });
};


// ============================================================
// INIT
// ============================================================

// separate the load logic into a function so we can refresh after checkout
function loadProductsFromDB() {
  posAjax.getProducts(
    function (data) {
      if (data && data.length > 0) {
        products = data;
      } else {
        products = [];
      }
      renderProducts();
      renderCart();
    },
    function () {
      products = [];
      renderProducts();
      renderCart();
      console.log("Failed to load products from database.");
    }
  );
}

// load products from the database on page load
$(document).ready(function () {
  loadProductsFromDB();
});
