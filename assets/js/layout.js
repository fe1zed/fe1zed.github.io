async function loadPartial(id, path) {
    const el = document.getElementById(id);
    if (!el) return;

    const res = await fetch(path, { cache: "no-cache" });
    el.innerHTML = await res.text();
}

function applyActiveNav() {
    const host = document.getElementById("site-header");
    if (!host) return;

    const activeKey = host.dataset.active;
    if (!activeKey) return;

    document.querySelectorAll(".nav-link[data-key]").forEach(link => {
        link.classList.toggle("is-active", link.dataset.key === activeKey);
    });
}

function nextPaint() {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

(async function initLayout() {
    try {
        // Load layout parts first
        await Promise.all([
            loadPartial("site-header", "/partials/header.html"),
            loadPartial("site-footer", "/partials/footer.html"),
        ]);

        applyActiveNav();

        // Wait for the DOM changes to be painted
        await nextPaint();
    } finally {
        // Show instantly (no fade)
        document.documentElement.classList.remove("boot");
    }
})();