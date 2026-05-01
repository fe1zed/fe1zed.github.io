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
        // Fallback: select text
        const range = document.createRange();
        range.selectNodeContents(code || pre);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });
  });

  // ── Scroll spy ──
  const navLinks = Array.from(document.querySelectorAll(".docs-nav a[href^='#']"));
  if (!navLinks.length) return;

  const sectionIds = navLinks.map((a) => a.getAttribute("href").slice(1));
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function getActiveId() {
    const threshold = 130; // px from top — section becomes "active"
    let activeId = sections[0] ? sections[0].id : null;
    for (const sec of sections) {
      const top = sec.getBoundingClientRect().top;
      if (top <= threshold) {
        activeId = sec.id;
      }
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
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateSpy();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  updateSpy();
})();
