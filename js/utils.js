// -- Shared utilities — must be loaded before main.js / asset.js / docs.js --

/** Treats "$0" / "0" as "Free", returns the original string otherwise. */
function formatSalePrice(p) {
  return parseFloat(p.replace(/[^0-9.]/g, "")) === 0 ? "Free" : p;
}

/** Extracts the YouTube video ID from a watch or short URL, or null. */
function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

/** True if the URL is a recognized YouTube watch link. */
function isYouTube(url) {
  return !!getYouTubeId(url);
}

/** Escapes the three HTML-significant characters; safe for text-node inserts. */
function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
}

/** Escapes regex metacharacters so a user string can be used inside `new RegExp`. */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// -- Copy-to-clipboard icons (shared across asset, docs, changelog) --
const ICON_COPY  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

/**
 * Wires up a copy button: on click, copies `getText()` to clipboard,
 * temporarily shows ICON_CHECK + adds `copiedClass`, then reverts after `delay`ms.
 */
function setupCopyButton(btn, getText, copiedClass = "copy-btn--copied", delay = 1800) {
  btn.addEventListener("click", () => {
    const text = typeof getText === "function" ? getText() : getText;
    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = ICON_CHECK;
      btn.classList.add(copiedClass);
      setTimeout(() => {
        btn.innerHTML = ICON_COPY;
        btn.classList.remove(copiedClass);
      }, delay);
    });
  });
}

/** Renders a list of tag strings as `<span class="tag">…</span>` chips. */
function renderTags(tags) {
  return (tags || []).map((t) => `<span class="tag">${t}</span>`).join("");
}

// -- Changelog rendering — shared by changelog.js + docs.js --

/** Long-format date: "April 9, 2026" */
function formatLongDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Anchor id from a semver string: "1.3.0" → "v1-3-0" */
function versionAnchorId(version) {
  return "v" + version.replace(/\./g, "-");
}

/** Renders a labelled list group, or empty string if the array is empty. */
function renderChangelogGroup(label, arr) {
  if (!arr || !arr.length) return "";
  return `<p class="changelog-group-label">${label}</p>
    <ul>${arr.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

/** Renders the body of one changelog entry — handles both Added/Changed/Fixed and flat items[]. */
function renderChangelogBody(entry) {
  const { added, changed, fixed, items } = entry;
  if (added || changed || fixed) {
    return renderChangelogGroup("Added",   added)
         + renderChangelogGroup("Changed", changed)
         + renderChangelogGroup("Fixed",   fixed);
  }
  return `<ul>${(items || []).map((i) => `<li>${i}</li>`).join("")}</ul>`;
}
