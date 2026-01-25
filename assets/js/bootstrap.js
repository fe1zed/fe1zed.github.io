(function () {
    const REPO = "/fe1zed.github.io";
    const base = location.pathname.startsWith(REPO + "/") ? REPO : "";

    window.__SITE_PREFIX__ = base;

    // Prevent double-inject if something includes it twice
    if (!document.querySelector('link[data-site-css="1"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = base + "/assets/css/site.css";
        link.setAttribute("data-site-css", "1");
        document.head.appendChild(link);
    }

    // Optional: set <base> too (helps with relative links if you ever use them)
    // if (!document.querySelector('base[data-site-base="1"]')) {
    //   const b = document.createElement("base");
    //   b.href = base + "/";
    //   b.setAttribute("data-site-base", "1");
    //   document.head.prepend(b);
    // }
})();
