(function () {
  "use strict";

  // -- Copy buttons on code blocks -- (uses shared utils.js)
  document.querySelectorAll(".docs-content pre").forEach((pre) => {
    const wrap = document.createElement("div");
    wrap.className = "pre-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = ICON_COPY;
    wrap.appendChild(btn);

    setupCopyButton(btn, () => {
      const code = pre.querySelector("code");
      return code ? code.innerText : pre.innerText;
    });
  });

  // -- Latest release in #changelog section --
  const clSection = document.getElementById("changelog");
  const backLink  = document.querySelector(".docs-back");

  if (clSection && backLink && typeof ASSETS !== "undefined") {
    const assetId = new URLSearchParams(new URL(backLink.href).search).get("id");
    const asset   = assetId ? ASSETS.find((a) => a.id === assetId) : null;

    if (asset && asset.changelog && asset.changelog.length) {
      const sorted = asset.changelog.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = sorted[0];

      // formatLongDate() and renderChangelogBody() are provided by utils.js
      clSection.innerHTML = `
        <h2>Changelog</h2>
        <div class="changelog-entry">
          <p class="changelog-version">v${latest.version} <span class="changelog-date">${formatLongDate(latest.date)}</span></p>
          ${renderChangelogBody(latest)}
        </div>
        <a class="docs-cl-all-link" href="../changelog.html?id=${assetId}">
          View all ${sorted.length} releases
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>`;
    }
  }

  // -- Scroll spy --
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

  // -- Docs search (Cmd+K / Ctrl+K) --
  setupDocsSearch();

  function setupDocsSearch() {
    const sectionsForSearch = Array.from(document.querySelectorAll(".docs-content section[id]"));
    const index = sectionsForSearch.map((s) => {
      const h2 = s.querySelector("h2");
      return {
        id: s.id,
        title: h2 ? h2.textContent.trim() : s.id,
        content: s.textContent.replace(/\s+/g, " ").trim(),
      };
    });
    if (!index.length) return;

    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    const shortcutKey = isMac ? "⌘↵" : "Ctrl ↵";

    // Modal
    const modal = document.createElement("div");
    modal.className = "docs-search-modal";
    modal.id = "docs-search-modal";
    modal.innerHTML = `
      <div class="docs-search-backdrop"></div>
      <div class="docs-search-panel">
        <div class="docs-search-input-wrap">
          <svg class="docs-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" id="docs-search-input" placeholder="Search this page…" autocomplete="off" />
        </div>
        <div class="docs-search-results" id="docs-search-results">
          <p class="docs-search-empty">Type to search…</p>
        </div>
        <div class="docs-search-footer">
          <span><kbd>↵</kbd>jump</span>
          <span><kbd>esc</kbd>close</span>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const input     = modal.querySelector("#docs-search-input");
    const resultsEl = modal.querySelector("#docs-search-results");
    const backdrop  = modal.querySelector(".docs-search-backdrop");

    let activeIdx = 0;
    let currentResults = [];

    // escapeHtml() and escapeRegex() are provided by utils.js

    function search(q) {
      const lq = q.trim().toLowerCase();
      if (!lq) return [];
      return index
        .map((item) => {
          const ti = item.title.toLowerCase().indexOf(lq);
          const ci = item.content.toLowerCase().indexOf(lq);
          if (ti === -1 && ci === -1) return null;
          return {
            ...item,
            score: ti !== -1 ? 1000 - ti : 500 - Math.min(ci, 500),
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }

    function buildSnippet(content, q) {
      const lc = content.toLowerCase();
      const lq = q.toLowerCase();
      const idx = lc.indexOf(lq);
      let s;
      if (idx === -1) {
        s = content.slice(0, 140);
      } else {
        const start = Math.max(0, idx - 30);
        const end   = Math.min(content.length, idx + lq.length + 110);
        s = content.slice(start, end);
        if (start > 0)             s = "…" + s;
        if (end < content.length)  s = s + "…";
      }
      const re = new RegExp(`(${escapeRegex(q)})`, "gi");
      return escapeHtml(s).replace(re, "<mark>$1</mark>");
    }

    function render() {
      if (currentResults.length === 0) {
        const q = input.value;
        resultsEl.innerHTML = `<p class="docs-search-empty">${q ? `No results for “${escapeHtml(q)}”` : "Type to search…"}</p>`;
        return;
      }
      resultsEl.innerHTML = currentResults
        .map((r, i) => `
          <a class="docs-search-result${i === activeIdx ? " docs-search-result--active" : ""}" href="#${r.id}" data-id="${r.id}">
            <div class="docs-search-result-title">${escapeHtml(r.title)}</div>
            <div class="docs-search-result-snippet">${buildSnippet(r.content, input.value)}</div>
          </a>`)
        .join("");
      const active = resultsEl.querySelector(".docs-search-result--active");
      if (active) active.scrollIntoView({ block: "nearest" });
    }

    function open() {
      modal.classList.add("docs-search-modal--open");
      document.body.style.overflow = "hidden";
      setTimeout(() => input.focus(), 30);
    }
    function close() {
      modal.classList.remove("docs-search-modal--open");
      document.body.style.overflow = "";
    }
    function navigate(id) {
      close();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          history.pushState(null, "", "#" + id);
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 80);
    }

    // Sidebar trigger button
    const sidebarHeader = document.querySelector(".docs-sidebar-header");
    if (sidebarHeader) {
      const trigger = document.createElement("button");
      trigger.className = "docs-search-trigger";
      trigger.type = "button";
      trigger.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Search docs</span>
        <kbd>${isMac ? "⌘" : "ctrl"}</kbd><kbd>↵</kbd>
      `;
      trigger.addEventListener("click", open);
      sidebarHeader.appendChild(trigger);
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        modal.classList.contains("docs-search-modal--open") ? close() : open();
      }
      if (e.key === "Escape" && modal.classList.contains("docs-search-modal--open")) {
        close();
      }
    });

    input.addEventListener("input", (e) => {
      activeIdx = 0;
      currentResults = search(e.target.value);
      render();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        // Enter → jump to selected result
        e.preventDefault();
        const r = currentResults[activeIdx];
        if (r) navigate(r.id);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentResults.length) {
          activeIdx = (activeIdx + 1) % currentResults.length;
          render();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentResults.length) {
          activeIdx = (activeIdx - 1 + currentResults.length) % currentResults.length;
          render();
        }
      }
    });

    backdrop.addEventListener("click", close);

    resultsEl.addEventListener("click", (e) => {
      const item = e.target.closest(".docs-search-result");
      if (item) {
        e.preventDefault();
        navigate(item.dataset.id);
      }
    });
  }
})();
