document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("cl-main");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // ── Shared helpers ──
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function versionId(version) {
    return "v" + version.replace(/\./g, "-");
  }

  function renderGroup(label, arr) {
    if (!arr || !arr.length) return "";
    return `<p class="changelog-group-label">${label}</p>
      <ul>${arr.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  }

  function renderEntry(entry, showChip, isLatest) {
    const { asset, version, date, added, changed, fixed, items } = entry;

    const body = (added || changed || fixed)
      ? renderGroup("Added", added) + renderGroup("Changed", changed) + renderGroup("Fixed", fixed)
      : `<ul>${(items || []).map((i) => `<li>${i}</li>`).join("")}</ul>`;

    const chip = showChip
      ? `<a class="cl-asset-chip" href="asset.html?id=${asset.id}">${asset.name}</a>`
      : "";

    const badge = isLatest ? `<span class="cl-latest-badge">Latest</span>` : "";

    return `
      <div class="cl-entry" id="${versionId(version)}">
        <div class="cl-entry-meta">
          ${chip}
          <span class="cl-version">v${version}</span>
          ${badge}
          <span class="cl-date">${formatDate(date)}</span>
        </div>
        <div class="cl-body">${body}</div>
      </div>`;
  }

  function buildSummary(entries) {
    let added = 0, changed = 0, fixed = 0;
    entries.forEach((e) => {
      added   += (e.added  || []).length + (e.items || []).length;
      changed += (e.changed || []).length;
      fixed   += (e.fixed  || []).length;
    });

    const parts = [`${entries.length} release${entries.length !== 1 ? "s" : ""}`];
    if (added)   parts.push(`${added} added`);
    if (changed) parts.push(`${changed} changed`);
    if (fixed)   parts.push(`${fixed} fixed`);

    return parts.join(" · ");
  }

  function buildJumpBar(entries) {
    const pills = entries
      .map((e, i) => `<a class="cl-jump-pill${i === 0 ? " cl-jump-pill--latest" : ""}" href="#${versionId(e.version)}">v${e.version}</a>`)
      .join("");
    return `<div class="cl-jump-bar">${pills}</div>`;
  }

  // ── Single-asset view ──
  if (id) {
    const asset = ASSETS.find((a) => a.id === id);

    if (!asset || !asset.changelog || !asset.changelog.length) {
      main.innerHTML = `<p class="cl-empty">No changelog found.</p>`;
      return;
    }

    document.title = `${asset.name} - Changelog`;

    const entries = asset.changelog
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    main.innerHTML = `
      <div class="cl-header">
        <a class="cl-back" href="asset.html?id=${asset.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          ${asset.name}
        </a>
        <h1 class="cl-heading">${asset.name} <span class="page-type-badge">Changelog</span></h1>
        <p class="cl-sub">${buildSummary(entries)}</p>
        ${buildJumpBar(entries)}
      </div>
      <div class="cl-list">
        ${entries.map((e, i) => renderEntry({ ...e, asset }, false, i === 0)).join("")}
      </div>`;
    return;
  }

  // No ?id — redirect home
  window.location.replace("index.html");
});
