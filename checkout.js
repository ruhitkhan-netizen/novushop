// ── LOAD CART FROM SHARED STATE ──────────────────────────────────────────────
// cart is defined in app.js — we reference it here after both scripts load

// ── RENDER ORDER SUMMARY ──────────────────────────────────────────────────────
function renderSummary() {
  const itemsEl  = document.getElementById("summaryItems");
  const emptyEl  = document.getElementById("summaryEmpty");
  const totalsEl = document.getElementById("summaryTotals");

  const entries = Object.entries(cart).filter(([, q]) => q > 0);

  if (entries.length === 0) {
    itemsEl.innerHTML      = "";
    emptyEl.style.display  = "flex";
    totalsEl.style.display = "none";
    return;
  }

  emptyEl.style.display  = "none";
  totalsEl.style.display = "flex";

  itemsEl.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(p => p.id === +id);
    if (!p) return "";
    return `
      <div class="summary-item">
        <span class="summary-item-emoji">${p.emoji}</span>
        <div class="summary-item-info">
          <p class="summary-item-name">${p.name}</p>
          <p class="summary-item-qty">Qty: ${qty}</p>
        </div>
        <span class="summary-item-price">$${(p.price * qty).toFixed(2)}</span>
      </div>
    `;
  }).join("");

  const sub = cartTotal();
  const tax = sub * 0.08;
  document.getElementById("sumSubtotal").textContent = `$${sub.toFixed(2)}`;
  document.getElementById("sumTax").textContent      = `$${tax.toFixed(2)}`;
  document.getElementById("sumTotal").textContent    = `$${(sub + tax).toFixed(2)}`;
}

// ── STEP NAVIGATION ───────────────────────────────────────────────────────────
function setStep(n) {
  ["sectionShipping","sectionPayment","sectionConfirm"].forEach((id, i) => {
    document.getElementById(id).classList.toggle("hidden", i + 1 !== n);
  });
  // update step indicators
  document.querySelectorAll(".step").forEach((el, i) => {
    el.classList.remove("active","done");
    if (i / 2 + 1 === n) el.classList.add("active");
    if (i / 2 + 1 < n)   el.classList.add("done");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── VALIDATION HELPERS ────────────────────────────────────────────────────────
function val(id) { return document.getElementById(id).value.trim(); }

function setErr(id, msg) {
  const el = document.getElementById("err" + id);
  if (el) el.textContent = msg;
  const input = document.getElementById(id.charAt(0).toLowerCase() + id.slice(1));
  if (input) input.classList.toggle("error", !!msg);
}

function clearErrs(...ids) { ids.forEach(id => setErr(id, "")); }

function validateShipping() {
  let ok = true;
  const checks = [
    ["FirstName",  val("firstName"),  v => v.length > 0,    "Required"],
    ["LastName",   val("lastName"),   v => v.length > 0,    "Required"],
    ["Email",      val("email"),      v => /\S+@\S+\.\S+/.test(v), "Enter a valid email"],
    ["Phone",      val("phone"),      v => v.replace(/\D/g,"").length >= 10, "Enter a valid phone"],
    ["Address",    val("address"),    v => v.length > 3,    "Enter your street address"],
    ["City",       val("city"),       v => v.length > 0,    "Required"],
    ["State",      val("state"),      v => v.length > 0,    "Select a state"],
    ["Zip",        val("zip"),        v => /^\d{5}$/.test(v),"Enter a 5-digit ZIP"],
  ];
  checks.forEach(([field, value, test, msg]) => {
    const err = test(value) ? "" : msg;
    setErr(field, err);
    if (err) ok = false;
  });
  return ok;
}

function validatePayment() {
  let ok = true;
  const checks = [
    ["CardName",   val("cardName"),   v => v.length > 2,               "Required"],
    ["CardNumber", val("cardNumber"), v => v.replace(/\s/g,"").length === 16, "Enter a 16-digit card number"],
    ["Expiry",     val("expiry"),     v => /^\d{2}\s\/\s\d{2}$/.test(v), "Format: MM / YY"],
    ["Cvv",        val("cvv"),        v => /^\d{3,4}$/.test(v),         "3 or 4 digits"],
  ];
  checks.forEach(([field, value, test, msg]) => {
    const err = test(value) ? "" : msg;
    setErr(field, err);
    if (err) ok = false;
  });
  return ok;
}

// ── STEP TRANSITIONS ──────────────────────────────────────────────────────────
function goToShipping() { setStep(1); }

function goToPayment() {
  if (!validateShipping()) return;
  setStep(2);
}

function goToConfirm() {
  if (!validatePayment()) return;

  // Populate confirm blocks
  document.getElementById("confirmShipping").innerHTML = `
    <h4>Shipping To</h4>
    <p>${val("firstName")} ${val("lastName")}</p>
    <p>${val("address")}, ${val("city")}, ${val("state")} ${val("zip")}</p>
    <p>${val("email")} · ${val("phone")}</p>
  `;

  const raw = val("cardNumber").replace(/\s/g,"");
  const masked = "**** **** **** " + raw.slice(-4);
  document.getElementById("confirmPayment").innerHTML = `
    <h4>Payment</h4>
    <p>${val("cardName")}</p>
    <p class="masked">${masked} &nbsp;·&nbsp; Exp ${val("expiry")}</p>
  `;

  setStep(3);
}

// ── PLACE ORDER ───────────────────────────────────────────────────────────────
function placeOrder() {
  const orderNum = Math.floor(Math.random() * 900000) + 100000;
  document.getElementById("confirmEmail").textContent = val("email");
  document.getElementById("orderNum").textContent = orderNum;

  // clear cart
  Object.keys(cart).forEach(k => delete cart[k]);

  document.getElementById("successModal").classList.remove("hidden");
}

// ── CARD FORMAT HELPERS ───────────────────────────────────────────────────────
function formatCard(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 16);
  input.value = v.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 3) v = v.slice(0,2) + " / " + v.slice(2);
  input.value = v;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
renderSummary();
setStep(1);
