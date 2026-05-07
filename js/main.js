function formatSalePrice(p) {
  return parseFloat(p.replace(/[^0-9.]/g, "")) === 0 ? "Free" : p;
}

function effectivePrice(asset) {
  const src = asset.salePrice || asset.price || "0";
  return parseFloat(src.replace(/[^0-9.]/g, "")) || 0;
}

function latestUpdate(asset) {
  if (!asset.changelog || !asset.changelog.length) return 0;
  return Math.max(...asset.changelog.map((e) => new Date(e.date).getTime()));
}

// ── State ──
let searchQuery = "";
let activeTag   = "All";
let sortBy      = "default";

function getFilteredAssets() {
  let results = ASSETS.slice();

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    results = results.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      (a.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  if (activeTag && activeTag !== "All") {
    results = results.filter((a) => (a.tags || []).includes(activeTag));
  }

  switch (sortBy) {
case "name-asc":   results.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "price-asc":  results.sort((a, b) => effectivePrice(a) - effectivePrice(b)); break;
    case "price-desc": results.sort((a, b) => effectivePrice(b) - effectivePrice(a)); break;
  }

  return results;
}

function renderCard(asset) {
  const card = document.createElement("article");
  card.className = "card";

  const tags = asset.tags
    .map((t) => `<span class="tag">${t}</span>`)
    .join("");

  card.innerHTML = `
    <div class="card-thumb">
      <img src="${asset.thumb}" alt="${asset.name}" loading="lazy" onerror="this.parentElement.classList.add('no-img')">
    </div>
    <div class="card-body">
      <div class="card-tags">${tags}</div>
      <h2 class="card-name">${asset.name}</h2>
      <p class="card-desc">${asset.description}</p>
      <div class="card-footer">
        <div class="card-price-wrap">
          ${asset.salePrice
            ? `<span class="card-price-original">${asset.price}</span><span class="card-price card-price--sale">${formatSalePrice(asset.salePrice)}</span>`
            : `<span class="card-price">${asset.price}</span>`}
        </div>
        <div class="card-actions">
          <a class="card-btn card-btn--ghost" href="asset.html?id=${asset.id}">Details</a>
          <a class="card-btn" href="${asset.storeUrl}" target="_blank" rel="noopener">Buy</a>
        </div>
      </div>
    </div>
  `;
  return card;
}

function renderCount(filteredCount) {
  const el = document.getElementById("asset-count");
  if (!el) return;
  const total = ASSETS.length;
  el.textContent = filteredCount === total
    ? `${total} asset${total !== 1 ? "s" : ""}`
    : `${filteredCount} of ${total}`;
}

function renderAssets() {
  const grid = document.getElementById("asset-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = getFilteredAssets();
  renderCount(filtered.length);

  if (filtered.length === 0) {
    const msg = document.createElement("p");
    msg.className = "search-empty";
    msg.textContent = searchQuery
      ? `No assets match “${searchQuery}”.`
      : `No assets in this category.`;
    grid.appendChild(msg);
    return;
  }

  filtered.forEach((asset) => grid.appendChild(renderCard(asset)));
}

function renderTagChips() {
  const container = document.getElementById("tag-chips");
  if (!container) return;

  const tags = ["All", ...[...new Set(ASSETS.flatMap((a) => a.tags || []))].sort()];

  container.innerHTML = tags
    .map((t) => `
      <button class="tag-chip${t === activeTag ? " tag-chip--active" : ""}" data-tag="${t}" type="button">${t}</button>
    `)
    .join("");

  container.querySelectorAll(".tag-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTag = btn.dataset.tag;
      renderTagChips();
      renderAssets();
    });
  });
}

function setupSearch() {
  const input = document.getElementById("asset-search");
  if (!input) return;
  input.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderAssets();
  });
}

function setupSort() {
  const dropdown  = document.getElementById("sort-dropdown");
  const btn       = document.getElementById("sort-btn");
  const menu      = document.getElementById("sort-menu");
  const currentEl = document.getElementById("sort-current");
  if (!btn || !menu) return;

  const labels = {
    "default":    "Default",
"name-asc":   "Name: A → Z",
    "price-asc":  "Price: Low → High",
    "price-desc": "Price: High → Low",
  };

  function setOption(value) {
    sortBy = value;
    currentEl.textContent = labels[value] || value;
    menu.querySelectorAll(".sort-option").forEach((opt) => {
      opt.classList.toggle("sort-option--active", opt.dataset.value === value);
    });
    renderAssets();
  }

  function openMenu() {
    menu.classList.add("sort-menu--open");
    btn.setAttribute("aria-expanded", "true");
    dropdown.classList.add("sort-dropdown--open");
  }

  function closeMenu() {
    menu.classList.remove("sort-menu--open");
    btn.setAttribute("aria-expanded", "false");
    dropdown.classList.remove("sort-dropdown--open");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.contains("sort-menu--open") ? closeMenu() : openMenu();
  });

  menu.addEventListener("click", (e) => {
    const opt = e.target.closest(".sort-option");
    if (!opt) return;
    setOption(opt.dataset.value);
    closeMenu();
  });

  document.addEventListener("click", () => closeMenu());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
}

function setupKeyboardShortcut() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const tag = document.activeElement?.tagName;
    // Don't hijack Enter when user is in an input/textarea/button/link/contenteditable
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A" || tag === "SELECT" || document.activeElement?.isContentEditable) return;
    e.preventDefault();
    document.getElementById("asset-search")?.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTagChips();
  setupSearch();
  setupSort();
  setupKeyboardShortcut();
  renderAssets();
});
