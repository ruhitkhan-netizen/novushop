// ── PRODUCT DATA ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  // Electronics
  { id: 1,  name: "Mechanical Keyboard",     category: "Electronics", price: 129.99, emoji: "⌨️",  desc: "Tactile switches, RGB backlit, compact TKL layout." },
  { id: 2,  name: "Wireless Earbuds",        category: "Electronics", price: 89.99,  emoji: "🎧",  desc: "35-hour battery, active noise cancellation, IPX4." },
  { id: 3,  name: "USB-C Hub 7-in-1",        category: "Electronics", price: 49.99,  emoji: "🔌",  desc: "4K HDMI, 3× USB-A, SD card, 100W PD passthrough." },
  { id: 4,  name: "Webcam 4K",               category: "Electronics", price: 109.99, emoji: "📷",  desc: "Sony sensor, auto-framing, built-in ring light." },
  { id: 5,  name: "Portable Charger 20K",    category: "Electronics", price: 39.99,  emoji: "🔋",  desc: "20,000 mAh, 65W PD, charges a laptop twice." },
  { id: 6,  name: "Smart LED Desk Lamp",     category: "Electronics", price: 59.99,  emoji: "💡",  desc: "Tunable white, wireless phone charger base." },

  // Gear
  { id: 7,  name: "Minimal Backpack 25L",    category: "Gear",        price: 149.99, emoji: "🎒",  desc: "Weather-resistant, laptop sleeve, hidden pockets." },
  { id: 8,  name: "Stainless Water Bottle",  category: "Gear",        price: 29.99,  emoji: "🫙",  desc: "40 oz, triple-insulated, keeps cold 48h." },
  { id: 9,  name: "Standing Desk Mat",       category: "Gear",        price: 44.99,  emoji: "🟫",  desc: "3/4\" thick foam, anti-fatigue, easy clean surface." },
  { id: 10, name: "Cable Organizer Kit",     category: "Gear",        price: 18.99,  emoji: "🗂️",  desc: "12-piece set: ties, sleeves, labels, clips." },

  // Lifestyle
  { id: 11, name: "Aromatherapy Diffuser",   category: "Lifestyle",   price: 34.99,  emoji: "🌿",  desc: "400ml, 7 LED colors, 6-hour timer, whisper-quiet." },
  { id: 12, name: "Pour-Over Coffee Kit",    category: "Lifestyle",   price: 52.99,  emoji: "☕",  desc: "Borosilicate carafe, reusable filter, kettle spout." },
  { id: 13, name: "Hardcover Notebook A5",   category: "Lifestyle",   price: 16.99,  emoji: "📓",  desc: "240 dotted pages, pen loop, bookmark ribbon." },
  { id: 14, name: "Desk Plant – Pothos",     category: "Lifestyle",   price: 22.99,  emoji: "🪴",  desc: "Low-maintenance, air-purifying, ships in ceramic pot." },

  // Office
  { id: 15, name: "Monitor Arm Single",      category: "Office",      price: 69.99,  emoji: "🖥️",  desc: "Full-motion, VESA 75/100, up to 32\" 15 kg." },
  { id: 16, name: "Ergonomic Mouse",         category: "Office",      price: 54.99,  emoji: "🖱️",  desc: "Vertical grip, 6 buttons, 4000 DPI, wireless." },
  { id: 17, name: "Wrist Rest Pad",          category: "Office",      price: 19.99,  emoji: "🫲",  desc: "Memory foam, non-slip base, washable cover." },
  { id: 18, name: "Whiteboard Desktop",      category: "Office",      price: 37.99,  emoji: "🗒️",  desc: "A2 size, glass surface, includes 4 markers, eraser." },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let cart = {};          // { productId: quantity }
let activeCategory = "All";
let searchQuery = "";

// ── DERIVED HELPERS ───────────────────────────────────────────────────────────
const categories = ["All", ...new Set(PRODUCTS.map(p => p.category))];

function getFiltered() {
  return PRODUCTS.filter(p => {
    const matchesCat   = activeCategory === "All" || p.category === activeCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery) ||
                         p.desc.toLowerCase().includes(searchQuery) ||
                         p.category.toLowerCase().includes(searchQuery);
    return matchesCat && matchesQuery;
  });
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find(p => p.id === +id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderCategories() {
  const nav = document.getElementById("categoryNav");
  nav.innerHTML = categories.map(cat => `
    <button class="cat-btn ${cat === activeCategory ? "active" : ""}"
            onclick="setCategory('${cat}')">${cat}</button>
  `).join("");
}

function renderProducts() {
  const grid    = document.getElementById("productGrid");
  const empty   = document.getElementById("emptyState");
  const title   = document.getElementById("sectionTitle");
  const counter = document.getElementById("productCount");

  const filtered = getFiltered();
  title.textContent = activeCategory === "All" ? "All Products" : activeCategory;
  counter.textContent = `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-img">${p.emoji}</div>
      <div class="product-info">
        <p class="product-category">${p.category}</p>
        <p class="product-name">${p.name}</p>
        <p class="product-desc">${p.desc}</p>
      </div>
      <div class="product-footer">
        <span class="product-price">$${p.price.toFixed(2)}</span>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

function renderCart() {
  const itemsEl  = document.getElementById("cartItems");
  const emptyEl  = document.getElementById("cartEmpty");
  const footerEl = document.getElementById("cartFooter");
  const countEl  = document.getElementById("cartCount");

  const count = cartCount();
  countEl.textContent = count;

  const entries = Object.entries(cart).filter(([,q]) => q > 0);

  if (entries.length === 0) {
    itemsEl.innerHTML  = "";
    emptyEl.style.display  = "flex";
    footerEl.style.display = "none";
    return;
  }

  emptyEl.style.display  = "none";
  footerEl.style.display = "flex";

  itemsEl.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(p => p.id === +id);
    if (!p) return "";
    return `
      <div class="cart-item">
        <div class="cart-item-emoji">${p.emoji}</div>
        <div>
          <p class="cart-item-name">${p.name}</p>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeItem(${p.id})">Remove</button>
        </div>
        <span class="cart-item-price">$${(p.price * qty).toFixed(2)}</span>
      </div>
    `;
  }).join("");

  const sub = cartTotal();
  const tax = sub * 0.08;
  document.getElementById("subtotal").textContent = `$${sub.toFixed(2)}`;
  document.getElementById("tax").textContent      = `$${tax.toFixed(2)}`;
  document.getElementById("total").textContent    = `$${(sub + tax).toFixed(2)}`;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────
function setCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderProducts();
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  const p = PRODUCTS.find(p => p.id === id);
  showToast(`${p.emoji} ${p.name} added to cart`);
}

function changeQty(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  if (cart[id] === 0) delete cart[id];
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  renderCart();
}

function openCart()  {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function checkout() {
  if (cartCount() === 0) {
    showToast("Your cart is empty!");
    return;
  }
  window.location.href = "checkout.html";
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderProducts();
});

// ── CART BUTTON ───────────────────────────────────────────────────────────────
document.getElementById("cartBtn").addEventListener("click", openCart);

// ── TOAST ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
renderCategories();
renderProducts();
renderCart();
