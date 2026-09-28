import "../components/site-chrome.js";
import { ASSETS, findAsset } from "../data/assets.js";
import { SHOWCASE } from "../data/showcase.js";
import { html, render } from "../lib/html.js";
import { icons, PLATFORM_ICONS } from "../lib/icons.js";
import { pluralize } from "../lib/format.js";
import { installImageFallbacks } from "../lib/image-fallback.js";
import { initCharCounters, setGroupError, shake, submitForm } from "../lib/forms.js";
import { assetHref, thumb } from "../components/asset-ui.js";

/* ============================================================
   Card rendering — shared by the grid and the live form preview
   ============================================================ */

const assetBadge = (asset) => html`
  <a class="icon-badge link-underline" href="${assetHref(asset)}" target="_blank" rel="noopener">${icons.asset()}${asset.name}</a>`;

const platformBadge = (platform, url) => url
  ? html`<a class="icon-badge link-underline" href="${url}" target="_blank" rel="noopener">${PLATFORM_ICONS[platform]}${platform}</a>`
  : html`<span class="icon-badge">${PLATFORM_ICONS[platform]}${platform}</span>`;

const assetBadges = (assets) => assets.filter(Boolean).map(assetBadge);
const platformBadges = (platforms, urls = {}) => platforms.map((p) => platformBadge(p, urls[p]));

const showcaseCard = (entry) => html`
  <article class="card showcase-card" data-href="${entry.projectUrl}" role="link" tabindex="0" aria-label="${entry.name} by ${entry.developer}">
    ${thumb(entry.thumb, entry.name, "zoom")}
    <div class="showcase-card-body">
      <p class="showcase-card-dev">${entry.developer}</p>
      <h2 class="showcase-card-name">${entry.name}</h2>
      <p class="showcase-card-desc">${entry.description}</p>
      ${entry.quote && html`<blockquote class="showcase-card-quote">${entry.quote}</blockquote>`}
      <div class="showcase-card-links">${assetBadges(entry.assets.map(findAsset))}</div>
      ${entry.platforms?.length > 0 && html`
        <div class="showcase-card-links showcase-card-links--platforms">${platformBadges(entry.platforms, entry.platformUrls)}</div>`}
    </div>
  </article>`;

/** The grid is padded with "Your game here" cards until it holds a full row. */
const GRID_MIN_CARDS = 3;

const ghostCard = (index) => html`
  <a class="card showcase-card showcase-ghost" href="#submit" style="--ghost-index: ${index}">
    <div class="card-thumb showcase-ghost-thumb">
      <span class="showcase-ghost-plus">${icons.plus()}</span>
    </div>
    <div class="showcase-card-body">
      <p class="showcase-card-dev">Your studio</p>
      <h2 class="showcase-card-name">Your game here</h2>
      <p class="showcase-card-desc">Built something with my tools? Submit it and it gets featured on this page.</p>
      <span class="showcase-ghost-cta">Submit your project ${icons.chevronRight()}</span>
    </div>
  </a>`;

function renderShowcase() {
  const grid = document.getElementById("showcase-grid");
  const count = document.getElementById("showcase-count");
  const ghosts = Math.max(0, GRID_MIN_CARDS - SHOWCASE.length);

  count.textContent = SHOWCASE.length ? pluralize(SHOWCASE.length, "project") : "";
  render(grid, [
    ...SHOWCASE.map(showcaseCard),
    ...Array.from({ length: ghosts }, (_, i) => ghostCard(i)),
  ]);

  // Whole card opens the project; inner links keep their own targets.
  const openCard = (e) => {
    const card = e.target.closest(".showcase-card[data-href]");
    if (card && !e.target.closest("a")) window.open(card.dataset.href, "_blank", "noopener");
  };
  grid.addEventListener("click", openCard);
  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    openCard(e);
  });
}

/* ============================================================
   Submit form
   ============================================================ */

function initSubmitForm() {
  const form = document.getElementById("showcase-form");
  const button = form.querySelector('[type="submit"]');
  const platformPills = document.getElementById("platform-pills");
  const assetPills = document.getElementById("asset-pills");
  const platformUrls = document.getElementById("platform-urls");
  const field = (name) => form.elements.namedItem(name);

  const checkPill = (name, value, label, icon) => html`
    <label class="check-pill"><input type="checkbox" name="${name}" value="${value}">${icon}${label}</label>`;

  render(platformPills, Object.keys(PLATFORM_ICONS).map((p) => checkPill("platforms", p, p, PLATFORM_ICONS[p])));
  // Submitted by name so the review email reads naturally.
  render(assetPills, ASSETS.map((a) => checkPill("assets", a.name, a.name)));

  const checked = (container) => [...container.querySelectorAll("input:checked")].map((i) => i.value);

  /* -- Per-platform URL fields, kept in selection order -- */
  function syncPlatformUrls() {
    const selected = checked(platformPills);
    for (const group of platformUrls.querySelectorAll("[data-platform]")) {
      if (!selected.includes(group.dataset.platform)) group.remove();
    }
    for (const platform of selected) {
      if (platformUrls.querySelector(`[data-platform="${CSS.escape(platform)}"]`)) continue;
      const id = `url-${platform.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      platformUrls.insertAdjacentHTML("beforeend", String(html`
        <div class="form-group platform-url-group" data-platform="${platform}">
          <label class="form-label" for="${id}">${platform} URL <span class="form-required">*</span></label>
          <input class="form-input" id="${id}" type="url" name="url_${platform}" placeholder="https://…" required>
        </div>`));
    }
  }

  /* -- Live preview -- */
  const preview = {
    img:       document.getElementById("preview-img"),
    empty:     document.getElementById("preview-thumb-empty"),
    dev:       document.getElementById("preview-dev"),
    name:      document.getElementById("preview-name"),
    desc:      document.getElementById("preview-desc"),
    quote:     document.getElementById("preview-quote"),
    assets:    document.getElementById("preview-assets"),
    platforms: document.getElementById("preview-platforms"),
  };

  const setText = (el, value) => { el.textContent = value || el.dataset.placeholder; };

  function updatePreview() {
    const value = (name) => field(name).value.trim();
    const thumbUrl = value("thumb");

    preview.img.hidden = !thumbUrl;
    preview.empty.hidden = Boolean(thumbUrl);
    if (thumbUrl) preview.img.src = thumbUrl;
    else preview.img.removeAttribute("src");

    setText(preview.name, value("project"));
    setText(preview.dev, value("developer"));
    setText(preview.desc, value("description"));

    preview.quote.hidden = !value("quote");
    preview.quote.textContent = value("quote");

    const urls = Object.fromEntries([...platformUrls.querySelectorAll("[data-platform]")]
      .map((g) => [g.dataset.platform, g.querySelector("input").value.trim()])
      .filter(([, url]) => url));

    render(preview.assets, assetBadges(checked(assetPills).map((name) => ASSETS.find((a) => a.name === name))));
    const platforms = checked(platformPills);
    preview.platforms.hidden = !platforms.length;
    render(preview.platforms, platformBadges(platforms, urls));
  }

  /* -- Validation (errors appear only after the first submit attempt) -- */
  let attempted = false;

  const isUrl = (value) => {
    try { return Boolean(new URL(value)); } catch { return false; }
  };

  function validateInput(input) {
    const value = input.value.trim();
    let message = "";
    if (input.required && !value) message = "This field is required.";
    else if (input.type === "url" && value && !isUrl(value)) message = "Please enter a valid URL (starting with https://).";
    else if (input.type === "email" && value && !input.validity.valid) message = "Please enter a valid email address.";
    setGroupError(input.closest(".form-group"), message);
    return !message;
  }

  function validatePills(container, message) {
    const ok = checked(container).length > 0;
    setGroupError(container.closest(".form-group"), ok ? "" : message);
    return ok;
  }

  const validatePlatforms = () => validatePills(platformPills, "Select at least one platform.");
  const validateAssets = () => validatePills(assetPills, "Select at least one asset.");
  const requiredInputs = () => [...form.querySelectorAll("input[required], textarea[required]")];

  form.addEventListener("input", (e) => {
    if (e.target.matches(".form-input")) {
      updatePreview();
      if (attempted && e.target.closest(".form-group--error")) validateInput(e.target);
    }
  });

  form.addEventListener("focusout", (e) => {
    if (attempted && e.target.matches("input[required], textarea[required]")) validateInput(e.target);
  });

  platformPills.addEventListener("change", () => {
    syncPlatformUrls();
    if (attempted) validatePlatforms();
    updatePreview();
  });

  assetPills.addEventListener("change", () => {
    if (attempted) validateAssets();
    updatePreview();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    attempted = true;

    const valid = [
      ...requiredInputs().map(validateInput),
      validatePlatforms(),
      validateAssets(),
    ].every(Boolean);

    if (!valid) {
      shake(button);
      form.querySelector(".form-group--error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";
    const error = document.getElementById("showcase-error");
    error.hidden = true;

    if (await submitForm(form)) {
      form.hidden = true;
      document.getElementById("showcase-success").hidden = false;
    } else {
      error.hidden = false;
      button.disabled = false;
      button.textContent = "Submit project";
    }
  });

  initCharCounters(form);
  updatePreview();
}

installImageFallbacks();
renderShowcase();
initSubmitForm();
