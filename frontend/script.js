/* =========================
   Helpers
========================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const formatIDR = (n) =>
  (Number(n) || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
const debounce = (fn, wait = 250) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
};

/* =========================
   Elements
========================= */
const cartButton = $("#cart-button");
const cart = $("#cart");
const cartItems = $("#cart-items");
const clearCartButton = $("#clear-cart");
const submitCartButton = $("#submit-cart");
const searchInput = $("#search-input");
const productList = $("#product-list");

/* =========================
   State
========================= */
let cartData = [];
let allProducts = [];

/* =========================
   Toast
========================= */
function ensureToastHost() {
  if (!$("#toast-host")) {
    const host = document.createElement("div");
    host.id = "toast-host";
    host.className = "toast-host";
    document.body.appendChild(host);
  }
}
function showToast(msg = "Done") {
  ensureToastHost();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  $("#toast-host").appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 200);
  }, 1500);
}

/* =========================
   LocalStorage
========================= */
const CART_KEY = "pk_cart";
const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cartData));
function loadCart() {
  try {
    cartData = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    cartData = [];
  }
}

/* =========================
   Fetch Products (2 API)
========================= */
async function fetchProducts() {
  try {
    const [foodsRes, toysRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/api/cat_foods", { mode: "cors" }),
      fetch("http://127.0.0.1:8000/api/cat_toys", { mode: "cors" }),
    ]);
    if (!foodsRes.ok || !toysRes.ok)
      throw new Error(`HTTP ${foodsRes.status}/${toysRes.status}`);

    const foodsJson = await foodsRes.json();
    const toysJson = await toysRes.json();

    // bentuk umum: array langsung, {data:[...]}, {data:{data:[...]}}
    const toArray = (j) => {
      if (Array.isArray(j)) return j;
      if (Array.isArray(j?.data)) return j.data;
      if (Array.isArray(j?.items)) return j.items;
      if (Array.isArray(j?.results)) return j.results;
      if (Array.isArray(j?.data?.data)) return j.data.data; // paginator
      return [];
    };

    const foods = toArray(foodsJson);
    const toys = toArray(toysJson);

    // Normalisasi, stok -> number (Infinity jika tak dibatasi)
    const norm = (arr, type) =>
      (Array.isArray(arr) ? arr : []).map((p, idx) => {
        const rawStock = p.stock ?? p.stok ?? null;
        const stockNum =
          rawStock === null || rawStock === "" || rawStock === "-"
            ? Infinity
            : Number(rawStock);
        return {
          id: String(
            p.id ??
              `${type}-${
                p.slug || p.name?.toLowerCase()?.replace(/\s+/g, "-") || idx
              }`
          ),
          name: p.product_name,
          price: Number(p.price ?? p.harga ?? 0),
          description: p.description ?? p.deskripsi ?? "",
          image: p.image ?? p.image_url ?? p.gambar ?? "",
          stockNum,
          _type: type,
        };
      });

    allProducts = [...norm(foods, "food"), ...norm(toys, "toy")];

    if (!allProducts.length) {
      productList.innerHTML = `<p class="no-products">Produk tidak ditemukan (cek struktur JSON API).</p>`;
      return;
    }
    renderProducts(allProducts);
  } catch (err) {
    console.error("Fetch error:", err);
    productList.innerHTML = `<p class="no-products">Gagal memuat produk. Cek CORS/Network.</p>`;
  }
}

/* =========================
   Render Products
========================= */
function productItemHTML(p) {
  const outOfStock = p.stockNum !== Infinity && p.stockNum <= 0;
  return `
    <div class="product-item" data-id="${String(p.id)}">
      <img src="${p.image || "./assets/images/placeholder.png"}" alt="${
    p.name
  }"/>
      <h3 title="${p.name}">${p.name}</h3>
      <p>${p.description || "No description"}</p>
      <div class="best-seller-bawah">
        <p class="price">${formatIDR(p.price)}</p>
        <p>Stock: ${p.stockNum === Infinity ? "∞" : p.stockNum}</p>
      </div>
      <button class="add-to-cart" ${
        outOfStock ? "disabled" : ""
      } aria-label="Add ${p.name} to cart">
        ${outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  `;
}
function renderProducts(products) {
  if (!productList) return;
  if (!products || !products.length) {
    productList.innerHTML = `<p class="no-products">Produk tidak ditemukan</p>`;
    return;
  }
  productList.innerHTML = products.map(productItemHTML).join("");
  $$(".product-item .add-to-cart", productList).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const wrap = e.currentTarget.closest(".product-item");
      const id = wrap?.dataset.id;
      const product = allProducts.find((p) => String(p.id) === id);
      if (product) addToCart(product);
    });
  });
}

/* =========================
   Cart
========================= */
function updateCartBadge() {
  cartButton?.setAttribute(
    "data-count",
    String(cartData.reduce((s, it) => s + (Number(it.qty) || 0), 0))
  );
}

function addToCart(product) {
  const ex = cartData.find((it) => String(it.id) === String(product.id));
  const currentQty = ex ? ex.qty : 0;

  // batas stok
  if (product.stockNum !== Infinity && currentQty >= product.stockNum) {
    showToast(`Maksimal stok ${product.stockNum}`);
    return;
  }

  if (ex) {
    ex.qty += 1;
  } else {
    cartData.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast("Added to cart");
}

function renderCart() {
  if (!cartItems) return;
  cartItems.innerHTML = "";
  let total = 0;

  cartData.forEach((item, index) => {
    const subtotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
    total += subtotal;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="cart-line">
        <span class="cart-line__title" title="${item.name}">${item.name}</span>
        <span class="cart-line__price">${formatIDR(item.price)}</span>
      </div>
      <div class="cart-actions">
        <button class="decrease" aria-label="Decrease quantity">−</button>
        <span class="qty">${item.qty}</span>
        <button class="increase" aria-label="Increase quantity">+</button>
        <button class="remove" aria-label="Remove item">×</button>
      </div>
    `;

    li.querySelector(".decrease").addEventListener("click", () => {
      if (item.qty > 1) {
        item.qty -= 1;
      } else {
        cartData.splice(index, 1);
      }
      saveCart();
      renderCart();
    });

    const incBtn = li.querySelector(".increase");
    incBtn.addEventListener("click", () => {
      if (item.stockNum !== Infinity && item.qty >= item.stockNum) {
        showToast(`Sudah maksimal (stok ${item.stockNum})`);
        return;
      }
      item.qty += 1;
      saveCart();
      renderCart();
    });

    li.querySelector(".remove").addEventListener("click", () => {
      cartData.splice(index, 1);
      saveCart();
      renderCart();
      showToast("Removed from cart");
    });

    // disable + bila sudah mencapai stok
    if (item.stockNum !== Infinity && item.qty >= item.stockNum) {
      incBtn.setAttribute("disabled", "");
    }

    cartItems.appendChild(li);
  });

  const totalLi = document.createElement("li");
  totalLi.className = "cart-total";
  totalLi.innerHTML = `<strong>Total: ${formatIDR(total)}</strong>`;
  cartItems.appendChild(totalLi);

  updateCartBadge();
}

/* =========================
   Search
========================= */
function handleSearch(keyword) {
  const key = (keyword || "").toLowerCase().trim();
  const filtered = !key
    ? allProducts
    : allProducts.filter((p) => p.name.toLowerCase().includes(key));
  renderProducts(filtered);
}
searchInput?.addEventListener(
  "input",
  debounce((e) => handleSearch(e.target.value), 200)
);

/* =========================
   Cart Toggle / Buttons
========================= */
cartButton?.addEventListener("click", () => cart?.classList.toggle("visible"));
clearCartButton?.addEventListener("click", () => {
  if (!cartData.length) return;
  cartData = [];
  saveCart();
  renderCart();
  showToast("Cart cleared");
});
submitCartButton?.addEventListener("click", () => {
  if (!cartData.length) {
    showToast("Cart is empty");
    return;
  }
  // TODO: kirim cart ke server (jika perlu)
  showToast("Checkout sukses!");
  cartData = [];
  saveCart();
  renderCart();
  cart?.classList.remove("visible");
});

/* =========================
   FAQ: accordion (1 terbuka, default pertama)
========================= */
function setupFAQ() {
  const qs = $$(".faq-question");
  if (!qs.length) return;

  // tutup semua
  qs.forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.classList.remove("active");
    btn.nextElementSibling?.setAttribute("hidden", "");
  });

  // buka pertama
  qs[0].setAttribute("aria-expanded", "true");
  qs[0].classList.add("active");
  qs[0].nextElementSibling?.removeAttribute("hidden");

  // klik -> buka satu, tutup lain
  qs.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      qs.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-expanded", "false");
        b.nextElementSibling?.setAttribute("hidden", "");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
      btn.nextElementSibling?.removeAttribute("hidden");
    });
  });
}

/* =========================
   Hamburger menu
========================= */
function setupHamburger() {
  const hamburger = $("#hamburger");
  const mobileMenu = $("#mobile-menu");
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", () => {
    const opened = hamburger.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", String(opened));
    opened
      ? mobileMenu.removeAttribute("hidden")
      : mobileMenu.setAttribute("hidden", "");
  });

  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      hamburger.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("hidden", "");
    });
  });
}

/* =========================
   Init
========================= */
(function init() {
  setupHamburger();
  setupFAQ();
  loadCart();
  renderCart();
  fetchProducts();
})();
