(function () {
  // Derive root URL from this script's own src — works on any host/subfolder.
  // layout.js is always at {root}/js/layout.js, so stripping that suffix gives
  // the absolute root URL (e.g. http://localhost:63342/fe1zed.github.io/).
  const scriptSrc = document.currentScript.src;
  const base = scriptSrc.substring(0, scriptSrc.lastIndexOf('/js/layout.js') + 1);

  const NAV_HTML = `
<nav class="site-nav">
  <a class="nav-logo" href="${base}index.html">fe1zed</a>
  <div class="nav-right">
    <a class="nav-link" href="${base}index.html">Home</a>
    <a class="nav-link" href="${base}contact.html">Contact</a>
    <a class="nav-link" href="https://assetstore.unity.com/publishers/128954">Asset Store</a>
    <div class="nav-divider"></div>
    <a class="nav-icon" href="https://github.com/fe1zed" target="_blank" rel="noopener" aria-label="GitHub">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
    </a>
    <a class="nav-icon" href="https://youtube.com/@fe1ze9" target="_blank" rel="noopener" aria-label="YouTube">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    </a>
  </div>
</nav>`;

  const FOOTER_HTML = `
<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="footer-logo">fe1zed</span>
      <span class="footer-tagline">Tools for Unity developers</span>
    </div>
    <div class="footer-cols">
      <div class="footer-col">
        <p class="footer-col-label">Navigation</p>
        <a href="${base}index.html">Home</a>
        <a href="${base}contact.html">Contact</a>
        <a href="https://assetstore.unity.com/publishers/128954" target="_blank" rel="noopener">Asset Store</a>
      </div>
      <div class="footer-col">
        <p class="footer-col-label">Socials</p>
        <a href="https://github.com/fe1zed" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
          GitHub
        </a>
        <a href="https://youtube.com/@fe1ze9" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          YouTube
        </a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} fe1zed. All rights reserved.</span>
  </div>
</footer>`;

  document.body.insertAdjacentHTML("afterbegin", NAV_HTML);
  document.body.insertAdjacentHTML("beforeend", FOOTER_HTML);

  const currentHref = window.location.href;
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.href && currentHref === link.href) {
      link.classList.add("nav-link--active");
    }
  });
})();
