import "../components/site-chrome.js";
import { ASSETS, findAsset } from "../data/assets.js";
import { html, render } from "../lib/html.js";
import { icons } from "../lib/icons.js";
import { pluralize, youTubeId } from "../lib/format.js";
import { absoluteUrl, setPageMeta } from "../lib/meta.js";
import { installImageFallbacks } from "../lib/image-fallback.js";
import { assetHref, priceTag, relatedCard, tagList } from "../components/asset-ui.js";
import { backLink } from "../components/back-link.js";
import { enhanceCodeBlocks } from "../components/code-block.js";
import { Lightbox } from "../components/lightbox.js";

const RELATED_LIMIT = 3;

const section = (title, body, className = "") => html`
  <section class="asset-section ${className}">
    <h2 class="asset-section-title">${title}</h2>
    ${body}
  </section>`;

/* -- Hero -- */

const hero = (asset) => html`
  <div class="asset-hero">
    <h1 class="asset-title asset-hero-name">${asset.name}</h1>
    <div class="asset-hero-content">
      ${tagList(asset.tags)}
      <p class="asset-hero-desc">${asset.longDescription || asset.description}</p>
      <div class="asset-hero-meta">
        ${asset.version && html`<span class="pill asset-meta-item">v${asset.version}</span>`}
        ${asset.unity && html`<span class="pill asset-meta-item">Unity ${asset.unity}</span>`}
      </div>
      ${priceTag(asset)}
      <div class="asset-hero-actions">
        <a class="btn btn--primary" href="${asset.storeUrl}" target="_blank" rel="noopener">Buy on Asset Store</a>
        ${asset.docsPage && html`<a class="btn btn--ghost" href="${asset.docsPage}">Documentation</a>`}
        ${asset.changelog?.length > 0 && html`<a class="btn btn--ghost" href="changelog.html?id=${asset.id}">Changelog</a>`}
      </div>
    </div>
    <div class="asset-hero-image" data-thumb>
      <img src="${asset.thumb}" alt="${asset.name}">
    </div>
  </div>`;

/* -- Screenshots -- */

function screenshot(src, index, name) {
  const videoId = youTubeId(src);
  const image = videoId
    ? html`<img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" data-fallback-src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${name} video" loading="lazy">`
    : html`<img src="${src}" alt="${name} screenshot ${index + 1}" loading="lazy">`;

  return html`
    <button class="screenshot${videoId ? " screenshot--video" : ""}" type="button" data-index="${index}" data-thumb aria-label="Open ${videoId ? "video" : "screenshot"} ${index + 1}">
      ${image}
      ${videoId && html`<span class="screenshot-play">${icons.play()}</span>`}
    </button>`;
}

const screenshots = (asset) => asset.screenshots?.length > 0 && html`
  <section class="asset-section asset-section--screenshots">
    <h2 class="asset-section-title">
      Screenshots
      <span class="screenshots-count" aria-hidden="true">1 / ${asset.screenshots.length}</span>
    </h2>
    <div class="screenshots-grid">${asset.screenshots.map((src, i) => screenshot(src, i, asset.name))}</div>
  </section>`;

/** Phones show the grid as a swipe carousel; keep the "n / total" counter in step. */
function trackCarousel(grid, counter) {
  const items = [...grid.children];
  let queued = false;
  grid.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const left = grid.getBoundingClientRect().left;
      const current = items.reduce((best, item, i) =>
        Math.abs(item.getBoundingClientRect().left - left) < Math.abs(items[best].getBoundingClientRect().left - left) ? i : best, 0);
      counter.textContent = `${current + 1} / ${items.length}`;
    });
  }, { passive: true });
}

/* -- Sticky buy bar (shown on phones once the hero buttons leave the screen) -- */

const buyBar = (asset) => html`
  <div class="buy-bar" aria-hidden="true">
    <div class="buy-bar-info">
      <div class="buy-bar-name">${asset.name}</div>
      ${priceTag(asset)}
    </div>
    <a class="btn btn--primary" href="${asset.storeUrl}" target="_blank" rel="noopener" tabindex="-1">Buy</a>
  </div>`;

function trackBuyBar(bar, heroActions) {
  document.body.classList.add("has-buy-bar");
  new IntersectionObserver(([entry]) => {
    // Only once the buttons have scrolled *above* the viewport, not before they're reached.
    const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    bar.classList.toggle("is-visible", show);
    bar.setAttribute("aria-hidden", String(!show));
    bar.querySelector("a").tabIndex = show ? 0 : -1;
  }).observe(heroActions);
}

/* -- Compatibility + dependencies -- */

function compatCell(status, pipeline) {
  if (status === true)  return html`<div class="grid-table-td" data-label="${pipeline}">${icons.statusOk()}<span class="compat-status compat-status--ok">Compatible</span></div>`;
  if (status === false) return html`<div class="grid-table-td" data-label="${pipeline}">${icons.statusNo()}<span class="compat-status compat-status--no">Not Supported</span></div>`;
  return html`<div class="grid-table-td" data-label="${pipeline}"><span class="compat-status compat-status--na">Not Tested</span></div>`;
}

function compatTable({ pipelines = [], unityVersions = [] }) {
  if (!pipelines.length) return null;
  return html`
    <div class="grid-table compat-table" style="--cols: minmax(120px, 1.2fr) repeat(${pipelines.length}, minmax(0, 1fr))">
      <div class="grid-table-head">
        <div class="grid-table-th">Unity Version</div>
        ${pipelines.map((p) => html`<div class="grid-table-th">${p}</div>`)}
      </div>
      ${unityVersions.map((v) => html`
        <div class="grid-table-row">
          <div class="grid-table-td compat-version">${v.version}</div>
          ${pipelines.map((p) => compatCell(v.pipelines?.[p], p))}
        </div>`)}
    </div>`;
}

const platformList = ({ platforms = [] }) => platforms.length > 0 && html`
  <div class="compat-platforms">
    <span class="compat-platforms-label">Platforms</span>
    ${platforms.map((p) => html`<span class="pill compat-platform">${p}</span>`)}
  </div>`;

/* Dependencies: one framed list beside the table, same height rhythm as its rows. */
function dependencyItem({ name, version, required = true, url }) {
  const body = html`
    <span class="dep-icon">${icons.package(16)}</span>
    <span class="dep-text">
      <span class="dep-name">${name}</span>
      <span class="dep-version">${version || "Any version"}</span>
    </span>
    <span class="dep-badge dep-badge--${required ? "req" : "opt"}">${required ? "Required" : "Optional"}</span>
    ${url && html`<span class="dep-link-icon">${icons.external(14)}</span>`}`;
  return html`<li>${url
    ? html`<a class="dep-item dep-item--link" href="${url}" target="_blank" rel="noopener">${body}</a>`
    : html`<div class="dep-item">${body}</div>`}</li>`;
}

function dependencyPanel({ dependencies = [] }) {
  if (!dependencies.length) return null;
  const required = dependencies.filter((d) => d.required !== false).length;
  const optional = dependencies.length - required;
  return html`
    <div class="dep-panel">
      <div class="dep-panel-head">
        <span>${pluralize(dependencies.length, "package")}</span>
        <span class="dep-panel-summary">${[required > 0 && `${required} required`, optional > 0 && `${optional} optional`].filter(Boolean).join(" · ")}</span>
      </div>
      <ul class="dep-list">${dependencies.map(dependencyItem)}</ul>
    </div>`;
}

function compatibility(asset) {
  const compat = compatTable(asset);
  const platforms = platformList(asset);
  const deps = dependencyPanel(asset);
  if (!compat && !platforms && !deps) return null;

  return html`
    <section class="asset-section">
      <div class="compat-layout">
        ${(compat || platforms) && html`
          <div class="compat-col">
            <h2 class="asset-section-title">Compatibility</h2>
            ${compat}${platforms}
          </div>`}
        ${deps && html`
          <div class="compat-col">
            <h2 class="asset-section-title">Dependencies</h2>
            ${deps}
          </div>`}
      </div>
    </section>`;
}

/* -- Quick start + related -- */

const quickStart = (asset) => asset.quickStart && section("Quick Start",
  html`<pre><code class="language-csharp">${asset.quickStart}</code></pre>`, "asset-quickstart");

/** Other assets ranked by number of shared tags; assets sharing none are skipped. */
function relatedAssets(asset) {
  return ASSETS
    .filter((other) => other.id !== asset.id)
    .map((other) => ({ other, score: other.tags.filter((t) => asset.tags.includes(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_LIMIT)
    .map(({ other }) => other);
}

function related(asset) {
  const items = relatedAssets(asset);
  return items.length > 0 && section("You might also like",
    html`<div class="related-grid">${items.map(relatedCard)}</div>`, "asset-section--related");
}

/* -- Page -- */

const main = document.getElementById("asset-main");
const asset = findAsset(new URLSearchParams(window.location.search).get("id"));

installImageFallbacks();

if (!asset) {
  render(main, html`<p class="empty-state">Asset not found. <a href="index.html">Go back</a></p>`);
} else {
  const description = asset.longDescription || asset.description;
  setPageMeta({
    title: `${asset.name} — fe1zed`,
    description,
    image: absoluteUrl(asset.thumb),
    url: absoluteUrl(assetHref(asset)),
    type: "product",
  });

  render(main, html`
    ${backLink({ href: "index.html", label: "All assets", trail: [{ label: "Home", href: "index.html" }, { label: asset.name }] })}
    ${hero(asset)}
    ${screenshots(asset)}
    ${compatibility(asset)}
    ${quickStart(asset)}
    ${related(asset)}
    ${buyBar(asset)}`);

  enhanceCodeBlocks(main);
  trackBuyBar(main.querySelector(".buy-bar"), main.querySelector(".asset-hero-actions"));

  if (asset.screenshots?.length > 0) {
    const lightbox = new Lightbox(asset.screenshots);
    const grid = main.querySelector(".screenshots-grid");
    trackCarousel(grid, main.querySelector(".screenshots-count"));
    grid.addEventListener("click", (e) => {
      const item = e.target.closest("[data-index]");
      if (item) lightbox.open(Number(item.dataset.index));
    });
  }
}
