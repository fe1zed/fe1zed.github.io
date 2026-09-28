import "../components/site-chrome.js";
import { findAsset } from "../data/assets.js";
import { escapeHtml, escapeRegex, html, raw, render, toElement } from "../lib/html.js";
import { icons } from "../lib/icons.js";
import { formatLongDate } from "../lib/format.js";
import { enhanceCodeBlocks } from "../components/code-block.js";
import { releaseBody, sortedReleases } from "../components/changelog.js";

/**
 * Docs page behaviour. The page declares its asset with <body data-asset="…">;
 * version info and the latest release are rendered from assets.js so docs never
 * drift from the store page.
 */
const asset = findAsset(document.body.dataset.asset);
const content = document.querySelector(".docs-content");

/* -- Hero meta: "v1.3.0 · Unity 2022.3+" -- */
const heroSub = document.querySelector("[data-asset-meta]");
if (asset && heroSub) {
  heroSub.textContent = [asset.version && `v${asset.version}`, asset.unity && `Unity ${asset.unity}`]
    .filter(Boolean)
    .join(" · ");
}

/* -- Latest release -- */
const changelogSection = document.getElementById("changelog");
const releases = sortedReleases(asset);
if (changelogSection && releases.length) {
  const [latest] = releases;
  render(changelogSection, html`
    <h2>Changelog</h2>
    <div class="changelog-entry">
      <div class="changelog-version">v${latest.version} <span class="changelog-date">${formatLongDate(latest.date)}</span></div>
      ${releaseBody(latest)}
    </div>
    <a class="docs-cl-all-link" href="../changelog.html?id=${asset.id}">View all ${releases.length} releases ${icons.chevronRight()}</a>`);
}

enhanceCodeBlocks(content);

/* -- Scroll spy -- */
const navLinks = [...document.querySelectorAll(".docs-nav a[href^='#']")];
const sections = navLinks.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
const SPY_OFFSET = 130;

function updateSpy() {
  let active = sections[0];
  for (const s of sections) if (s.getBoundingClientRect().top <= SPY_OFFSET) active = s;
  for (const a of navLinks) a.classList.toggle("is-active", a.hash === `#${active?.id}`);
  tocCurrent.textContent = navLinks.find((a) => a.hash === `#${active?.id}`)?.textContent ?? "";
}

/* -- Contents toggle (phones: the full index would push the page down a screen) -- */
const sidebar = document.querySelector(".docs-sidebar");
const docsNav = sidebar.querySelector(".docs-nav");
docsNav.id ||= "docs-nav";

const tocToggle = toElement(html`
  <button class="docs-toc-toggle" type="button" aria-expanded="false" aria-controls="${docsNav.id}">
    <span class="docs-toc-label">Contents</span>
    <span class="docs-toc-current"></span>
    ${icons.chevronDown(12)}
  </button>`);
const tocCurrent = tocToggle.querySelector(".docs-toc-current");
docsNav.before(tocToggle);

function setTocOpen(open) {
  sidebar.classList.toggle("is-toc-open", open);
  tocToggle.setAttribute("aria-expanded", String(open));
}

tocToggle.addEventListener("click", () => setTocOpen(!sidebar.classList.contains("is-toc-open")));
docsNav.addEventListener("click", (e) => { if (e.target.closest("a")) setTocOpen(false); });

let spyQueued = false;
window.addEventListener("scroll", () => {
  if (spyQueued) return;
  spyQueued = true;
  requestAnimationFrame(() => { updateSpy(); spyQueued = false; });
}, { passive: true });
updateSpy();

/* -- Search (Ctrl/⌘ + Enter) -- */
const MAX_RESULTS = 10;
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

const index = [...content.querySelectorAll("section[id]")].map((s) => ({
  id: s.id,
  title: s.querySelector("h2")?.textContent.trim() ?? s.id,
  text: s.textContent.replace(/\s+/g, " ").trim(),
}));

/** Title hits outrank body hits; earlier matches outrank later ones. */
function search(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .map((item) => {
      const inTitle = item.title.toLowerCase().indexOf(q);
      const inText = item.text.toLowerCase().indexOf(q);
      if (inTitle === -1 && inText === -1) return null;
      return { ...item, score: inTitle !== -1 ? 1000 - inTitle : 500 - Math.min(inText, 500) };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}

function snippet(text, query) {
  const at = text.toLowerCase().indexOf(query.trim().toLowerCase());
  const start = Math.max(0, at - 30);
  const end = Math.min(text.length, at === -1 ? 140 : at + query.length + 110);
  const excerpt = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  const marker = new RegExp(`(${escapeRegex(escapeHtml(query.trim()))})`, "gi");
  return raw(escapeHtml(excerpt).replace(marker, "<mark>$1</mark>"));
}

const modal = toElement(html`
  <div class="modal docs-search" role="dialog" aria-modal="true" aria-label="Search documentation" aria-hidden="true">
    <div class="modal-backdrop"></div>
    <div class="docs-search-panel">
      <div class="docs-search-input-wrap">
        ${icons.search()}
        <input class="docs-search-input" type="search" placeholder="Search this page…" autocomplete="off" aria-label="Search this page" aria-controls="docs-search-results">
      </div>
      <div class="docs-search-results" id="docs-search-results" role="listbox"></div>
      <div class="docs-search-footer">
        <span><kbd class="kbd">↵</kbd>jump</span>
        <span><kbd class="kbd">esc</kbd>close</span>
      </div>
    </div>
  </div>`);
document.body.append(modal);

const input = modal.querySelector(".docs-search-input");
const resultsEl = modal.querySelector(".docs-search-results");
let results = [];
let activeIndex = 0;

function renderResults() {
  if (!results.length) {
    render(resultsEl, html`<p class="docs-search-empty">${input.value.trim() ? `No results for “${input.value}”` : "Type to search…"}</p>`);
    return;
  }
  render(resultsEl, results.map((r, i) => html`
    <a class="docs-search-result" href="#${r.id}" role="option" aria-selected="${i === activeIndex}">
      <div class="docs-search-result-title">${r.title}</div>
      <div class="docs-search-result-snippet">${snippet(r.text, input.value)}</div>
    </a>`));
  resultsEl.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
}

const isOpen = () => modal.classList.contains("modal--open");

function openSearch() {
  modal.classList.add("modal--open");
  modal.removeAttribute("aria-hidden");
  document.body.style.overflow = "hidden";
  renderResults();
  requestAnimationFrame(() => input.focus());
}

function closeSearch() {
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function jumpTo(id) {
  closeSearch();
  const target = document.getElementById(id);
  if (!target) return;
  history.pushState(null, "", `#${id}`);
  target.scrollIntoView({ behavior: "smooth" });
}

input.addEventListener("input", () => {
  results = search(input.value);
  activeIndex = 0;
  renderResults();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (results[activeIndex]) jumpTo(results[activeIndex].id);
  } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && results.length) {
    e.preventDefault();
    const step = e.key === "ArrowDown" ? 1 : -1;
    activeIndex = (activeIndex + step + results.length) % results.length;
    renderResults();
  }
});

resultsEl.addEventListener("click", (e) => {
  const link = e.target.closest(".docs-search-result");
  if (!link) return;
  e.preventDefault();
  jumpTo(link.hash.slice(1));
});

modal.querySelector(".modal-backdrop").addEventListener("click", closeSearch);

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    isOpen() ? closeSearch() : openSearch();
  } else if (e.key === "Escape" && isOpen()) {
    closeSearch();
  }
});

document.querySelector(".docs-sidebar-header")?.append(toElement(html`
  <button class="docs-search-trigger" type="button">
    ${icons.search(14)}
    <span>Search docs</span>
    <kbd class="kbd">${isMac ? "⌘" : "ctrl"}</kbd><kbd class="kbd">↵</kbd>
  </button>`));
document.querySelector(".docs-search-trigger")?.addEventListener("click", openSearch);
