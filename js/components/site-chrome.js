import { html, render } from "../lib/html.js";
import { icons } from "../lib/icons.js";

/**
 * <site-nav> and <site-footer>: the shared chrome, defined once.
 * Links resolve against the site root derived from this module's URL, so pages
 * at any depth (docs/…) link correctly on any host or sub-folder.
 */
const ROOT = new URL("../../", import.meta.url);
const STORE_URL = "https://assetstore.unity.com/publishers/128954";

const PAGES = [
  { label: "Home",     path: "index.html" },
  { label: "Showcase", path: "showcase.html" },
  { label: "Contact",  path: "contact.html" },
];

const SOCIALS = [
  { label: "GitHub",  url: "https://github.com/fe1zed",   icon: icons.github },
  { label: "YouTube", url: "https://youtube.com/@fe1ze9", icon: icons.youtube },
];

const pageUrl = (path) => new URL(path, ROOT).href;

const currentPath = (() => {
  const { pathname } = window.location;
  return pathname.endsWith("/") ? `${pathname}index.html` : pathname;
})();

const isCurrent = (path) => new URL(path, ROOT).pathname === currentPath;

const external = (url, label, content, className) =>
  html`<a class="${className}" href="${url}" target="_blank" rel="noopener" aria-label="${label}">${content}</a>`;

/** Matches the CSS breakpoint where the menu turns into a full-screen sheet. */
const MOBILE_NAV = window.matchMedia("(max-width: 720px)");

class SiteNav extends HTMLElement {
  connectedCallback() {
    if (this.childElementCount) return;

    const links = [
      ...PAGES.map(({ label, path }) => ({ label, href: pageUrl(path), current: isCurrent(path) })),
      { label: "Asset Store", href: STORE_URL, external: true },
    ];

    render(this, html`
      <nav class="site-nav" aria-label="Main">
        <a class="nav-logo" href="${pageUrl("index.html")}">fe1zed</a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Menu">
          <span class="nav-toggle-open">${icons.menu()}</span>
          <span class="nav-toggle-close">${icons.close()}</span>
        </button>
        <div class="nav-menu" id="nav-menu">
          ${links.map(({ label, href, current, external: isExternal }, i) => html`
            <a class="nav-link link-underline${current ? " is-active" : ""}" href="${href}" style="--i:${i}"${current ? html` aria-current="page"` : ""}${isExternal ? html` target="_blank" rel="noopener"` : ""}>
              ${label}
              <span class="nav-link-arrow">${isExternal ? icons.external(18) : icons.chevronRight(18)}</span>
            </a>`)}
          <div class="nav-divider" role="presentation"></div>
          <div class="nav-socials" style="--i:${links.length}">
            ${SOCIALS.map(({ label, url, icon }) => html`
              <a class="nav-icon" href="${url}" target="_blank" rel="noopener">${icon()}<span class="nav-icon-label">${label}</span></a>`)}
          </div>
        </div>
      </nav>`);

    const nav = this.querySelector(".site-nav");
    const toggle = this.querySelector(".nav-toggle");
    const menu = this.querySelector(".nav-menu");
    const isOpen = () => nav.classList.contains("site-nav--open");

    const setOpen = (open, { restoreFocus = false } = {}) => {
      if (open === isOpen()) return;
      nav.classList.toggle("site-nav--open", open);
      this.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
      // The sheet covers the page, so the page underneath shouldn't scroll.
      document.documentElement.classList.toggle("nav-locked", open);
      if (open) menu.querySelector("a")?.focus({ preventScroll: true });
      else if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => setOpen(!isOpen()));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("click", (e) => { if (!this.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false, { restoreFocus: menu.contains(document.activeElement) }); });
    // Rotating a phone or widening the window past the breakpoint drops the sheet.
    MOBILE_NAV.addEventListener("change", (e) => { if (!e.matches) setOpen(false); });
    // Coming back via the back/forward cache must not restore an open, scroll-locked menu.
    window.addEventListener("pageshow", () => setOpen(false));
  }
}

/* -- Back links: return through history when it leads to the same page --
   Going "back" to the page the visitor actually came from restores its scroll
   position (e.g. halfway down the home grid). Otherwise it's a normal link. */
const sameDocument = (url) => {
  const u = new URL(url, window.location.href);
  return `${u.origin}${u.pathname.replace(/\/$/, "/index.html")}${u.search}`;
};

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-back]");
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!document.referrer || window.history.length < 2) return;
  if (sameDocument(document.referrer) !== sameDocument(link.href)) return;
  e.preventDefault();
  window.history.back();
});

class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.childElementCount) return;

    render(this, html`
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="footer-logo">fe1zed</span>
            <span class="footer-tagline">Tools for Unity developers</span>
          </div>
          <div class="footer-cols">
            <div class="footer-col">
              <p class="footer-col-label">Navigation</p>
              ${PAGES.map(({ label, path }) => html`<a class="link-underline" href="${pageUrl(path)}">${label}</a>`)}
              <a class="link-underline" href="${STORE_URL}" target="_blank" rel="noopener">Asset Store</a>
            </div>
            <div class="footer-col">
              <p class="footer-col-label">Socials</p>
              ${SOCIALS.map(({ label, url, icon }) => html`
                <a class="link-underline" href="${url}" target="_blank" rel="noopener">${icon(14)}${label}</a>`)}
            </div>
          </div>
        </div>
        <div class="footer-bottom">© ${new Date().getFullYear()} fe1zed. All rights reserved.</div>
      </footer>`);
  }
}

customElements.define("site-nav", SiteNav);
customElements.define("site-footer", SiteFooter);
