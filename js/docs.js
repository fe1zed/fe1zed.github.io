(function () {
  "use strict";

  // ── Copy buttons on code blocks ──
  document.querySelectorAll(".docs-content pre").forEach((pre) => {
    const wrap = document.createElement("div");
    wrap.className = "pre-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    wrap.appendChild(btn);

    btn.addEventListener("click", () => {
      const code = pre.querySelector("code");
      const text = code ? code.innerText : pre.innerText;

      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add("copy-btn--copied");
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
          btn.classList.remove("copy-btn--copied");
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        }, 1800);
      }).catch(() => {
        const range = document.createRange();
        range.selectNodeContents(code || pre);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });
  });

  // ── Latest release in #changelog section ──
  const clSection = document.getElementById("changelog");
  const backLink  = document.querySelector(".docs-back");

  if (clSection && backLink && typeof ASSETS !== "undefined") {
    const assetId = new URLSearchParams(new URL(backLink.href).search).get("id");
    const asset   = assetId ? ASSETS.find((a) => a.id === assetId) : null;

    if (asset && asset.changelog && asset.changelog.length) {
      const sorted = asset.changelog.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = sorted[0];
      const total  = sorted.length;

      const dateStr = new Date(latest.date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });

      function group(label, arr) {
        if (!arr || !arr.length) return "";
        return `<p class="changelog-group-label">${label}</p>
          <ul>${arr.map((i) => `<li>${i}</li>`).join("")}</ul>`;
      }

      const body = (latest.added || latest.changed || latest.fixed)
        ? group("Added", latest.added) + group("Changed", latest.changed) + group("Fixed", latest.fixed)
        : `<ul>${(latest.items || []).map((i) => `<li>${i}</li>`).join("")}</ul>`;

      clSection.innerHTML = `
        <h2>Changelog</h2>
        <div class="changelog-entry">
          <p class="changelog-version">v${latest.version} <span class="changelog-date">${dateStr}</span></p>
          ${body}
        </div>
        <a class="docs-cl-all-link" href="../changelog.html?id=${assetId}">
          View all ${total} releases
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>`;
    }
  }

  // ── Scroll spy ──
  const navLinks = Array.from(document.querySelectorAll(".docs-nav a[href^='#']"));
  if (!navLinks.length) return;

  const sectionIds = navLinks.map((a) => a.getAttribute("href").slice(1));
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function getActiveId() {
    const threshold = 130;
    let activeId = sections[0] ? sections[0].id : null;
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= threshold) activeId = sec.id;
    }
    return activeId;
  }

  function updateSpy() {
    const activeId = getActiveId();
    navLinks.forEach((a) => {
      a.classList.toggle("docs-nav-active", a.getAttribute("href") === "#" + activeId);
    });
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateSpy(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  updateSpy();
})();
