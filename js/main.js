function formatSalePrice(p) {
  return parseFloat(p.replace(/[^0-9.]/g, "")) === 0 ? "Free" : p;
}

function renderAssets() {
  const grid = document.getElementById("asset-grid");

  ASSETS.forEach((asset) => {
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

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderAssets);
