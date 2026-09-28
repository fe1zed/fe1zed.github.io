import { html } from "../lib/html.js";
import { formatSalePrice } from "../lib/format.js";

/** Link to an asset page, relative to the site root. */
export const assetHref = (asset) => `asset.html?id=${encodeURIComponent(asset.id)}`;

export const priceTag = ({ price, salePrice }) => salePrice
  ? html`<div class="price"><span class="price-original">${price}</span><span class="price-current price-current--sale">${formatSalePrice(salePrice)}</span></div>`
  : html`<div class="price"><span class="price-current">${price}</span></div>`;

export const tagList = (tags = []) =>
  html`<div class="tag-list">${tags.map((tag) => html`<span class="pill tag">${tag}</span>`)}</div>`;

/** 16:9 thumbnail; a failed load turns into the "No preview" placeholder. */
export const thumb = (src, alt, effect) => html`
  <div class="card-thumb${effect ? ` card-thumb--${effect}` : ""}" data-thumb>
    <img src="${src}" alt="${alt}" loading="lazy">
  </div>`;

/** Home grid card. */
export const assetCard = (asset) => html`
  <a class="card asset-card" href="${assetHref(asset)}">
    ${thumb(asset.thumb, asset.name, "zoom")}
    <div class="asset-card-body">
      <div class="asset-card-header">
        <div class="asset-card-heading">
          ${tagList(asset.tags)}
          <h2 class="asset-card-name">${asset.name}</h2>
        </div>
        ${priceTag(asset)}
      </div>
      <p class="asset-card-desc">${asset.description}</p>
    </div>
  </a>`;

/** Compact card for "You might also like". */
export const relatedCard = (asset) => html`
  <a class="card related-card" href="${assetHref(asset)}">
    ${thumb(asset.thumb, asset.name, "fade")}
    <div class="related-card-body">
      ${tagList(asset.tags)}
      <p class="related-card-name">${asset.name}</p>
      ${priceTag(asset)}
    </div>
  </a>`;
