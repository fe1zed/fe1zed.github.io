import "../components/site-chrome.js";
import { findAsset } from "../data/assets.js";
import { html, render } from "../lib/html.js";
import { formatLongDate, versionAnchor } from "../lib/format.js";
import { setPageMeta } from "../lib/meta.js";
import { releaseBody, releaseSummary, sortedReleases } from "../components/changelog.js";
import { backLink } from "../components/back-link.js";

const id = new URLSearchParams(window.location.search).get("id");
if (!id) window.location.replace("index.html");

const main = document.getElementById("cl-main");
const asset = findAsset(id);
const releases = sortedReleases(asset);

const jumpBar = () => html`
  <nav class="cl-jump-bar" aria-label="Releases">
    ${releases.map(({ version }, i) => i === 0
      ? html`<a class="chip chip--sm chip--active" href="#${versionAnchor(version)}">LATEST v${version}</a>`
      : html`<a class="chip chip--sm" href="#${versionAnchor(version)}">v${version}</a>`)}
  </nav>`;

const entry = (release, isLatest) => html`
  <article class="cl-entry" id="${versionAnchor(release.version)}">
    <div class="cl-entry-meta">
      <span class="cl-version">v${release.version}</span>
      ${isLatest && html`<span class="badge-inverse badge-inverse--sm">Latest</span>`}
      <time class="cl-date" datetime="${release.date}">${formatLongDate(release.date)}</time>
    </div>
    <div class="cl-body prose">${releaseBody(release)}</div>
  </article>`;

if (id && !releases.length) {
  render(main, html`<p class="empty-state">No changelog found.</p>`);
} else if (id) {
  setPageMeta({
    title: `${asset.name} — Changelog`,
    description: `Full release history for ${asset.name}.`,
  });

  render(main, html`
    <header class="cl-header">
      ${backLink({
        href: `asset.html?id=${asset.id}`,
        label: asset.name,
        trail: [{ label: "Home", href: "index.html" }, { label: asset.name, href: `asset.html?id=${asset.id}` }, { label: "Changelog" }],
      })}
      <h1 class="cl-heading">${asset.name} <span class="page-type-badge">Changelog</span></h1>
      <p class="cl-summary">${releaseSummary(releases)}</p>
      ${jumpBar()}
    </header>
    <div class="cl-list">${releases.map((r, i) => entry(r, i === 0))}</div>`);

  // Content arrives after the browser's own fragment scroll; redo it.
  if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
}
