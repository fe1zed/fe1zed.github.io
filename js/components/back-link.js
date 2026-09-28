import { html } from "../lib/html.js";
import { icons } from "../lib/icons.js";

/**
 * Outlined "back" button with an optional count badge and breadcrumb trail.
 * `trail` is [{ label, href? }]; the last entry is the current page.
 * The data-back hook lets site-chrome.js return via history when the visitor
 * came from that exact page, so they land where they left off.
 */
export const backLink = ({ href, label, count, trail = [] }) => html`
  <nav class="back-nav" aria-label="Breadcrumb">
    <a class="back-btn" href="${href}" data-back>
      <span class="back-btn-icon">${icons.arrowLeft(16)}</span>
      <span class="back-btn-label">${label}</span>
      ${count > 0 && html`<span class="back-btn-count" aria-label="${count} total">${count}</span>`}
    </a>
    ${trail.length > 0 && html`
      <ol class="crumbs">
        ${trail.map(({ label: text, href: link }, i) => i === trail.length - 1
          ? html`<li aria-current="page">${text}</li>`
          : html`<li><a class="link-underline" href="${link}">${text}</a></li>`)}
      </ol>`}
  </nav>`;
