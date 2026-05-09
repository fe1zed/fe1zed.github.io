document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const asset = ASSETS.find((a) => a.id === id);
  const main = document.getElementById("asset-main");

  if (!asset) {
    main.innerHTML = `<p class="asset-not-found">Asset not found. <a href="index.html">Go back</a></p>`;
    return;
  }

  document.title = `${asset.name} - fe1zed`;

  // ── SEO meta tags ──
  function setMeta(attr, attrVal, content) {
    let el = document.querySelector(`meta[${attr}="${attrVal}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  const desc = asset.longDescription || asset.description;
  const thumb = `https://fe1zed.github.io/${asset.thumb}`;
  const url   = `https://fe1zed.github.io/asset.html?id=${asset.id}`;

  setMeta("name",     "description",        desc);
  setMeta("property", "og:title",           `${asset.name} — fe1zed`);
  setMeta("property", "og:description",     desc);
  setMeta("property", "og:image",           thumb);
  setMeta("property", "og:url",             url);
  setMeta("property", "og:type",            "product");
  setMeta("name",     "twitter:card",       "summary_large_image");
  setMeta("name",     "twitter:title",      `${asset.name} — fe1zed`);
  setMeta("name",     "twitter:description", desc);
  setMeta("name",     "twitter:image",      thumb);

  // getYouTubeId(), isYouTube(), formatSalePrice() are provided by utils.js

  // ── Build sections ── (renderTags from utils.js)
  const tags = renderTags(asset.tags);

  const features = (asset.features || [])
    .map((f) => `<li class="feature-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${f}</li>`)
    .join("");

  // ── Compatibility table ──
  const pipelines = asset.pipelines || [];
  const cols = pipelines.length;
  const colTemplate = `160px repeat(${cols}, 1fr)`;

  const checkIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="rgba(76,175,80,0.12)" stroke="#4caf50" stroke-width="1.5"/>
    <polyline points="7.5 12 10.5 15 16.5 9" stroke="#4caf50" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const crossIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="rgba(229,115,115,0.1)" stroke="#e57373" stroke-width="1.5"/>
    <line x1="8" y1="8" x2="16" y2="16" stroke="#e57373" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="16" y1="8" x2="8" y2="16" stroke="#e57373" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;

  // Normalise entries: string → all pipelines compatible, object → use per-pipeline status
  const rawVersions = asset.unityVersions || (asset.unity ? [asset.unity] : []);
  const versions = rawVersions.map((v) => {
    if (typeof v === "string") {
      const map = {};
      pipelines.forEach((p) => { map[p] = true; });
      return { version: v, pipelines: map };
    }
    return v;
  });

  function pipelineCell(entry, pipeline) {
    const status = entry.pipelines?.[pipeline];
    if (status === true)  return `<div class="compat-td">${checkIcon}<span class="compat-status compat-status--ok">Compatible</span></div>`;
    if (status === false) return `<div class="compat-td">${crossIcon}<span class="compat-status compat-status--no">Not Supported</span></div>`;
    return `<div class="compat-td"><span class="compat-status compat-status--na">Not Tested</span></div>`;
  }

  const compatTable = cols ? `
    <div class="compat-table">
      <div class="compat-thead" style="grid-template-columns:${colTemplate}">
        <div class="compat-th compat-th--version">Unity Version</div>
        ${pipelines.map((p) => `<div class="compat-th">${p}</div>`).join("")}
      </div>
      <div class="compat-tbody">
        ${versions.map((v) => `
        <div class="compat-tr" style="grid-template-columns:${colTemplate}">
          <div class="compat-td compat-td--version">${v.version}</div>
          ${pipelines.map((p) => pipelineCell(v, p)).join("")}
        </div>`).join("")}
      </div>
    </div>` : "";

  const compatPlatforms = (asset.platforms && asset.platforms.length) ? `
    <div class="compat-platforms">
      <span class="compat-platforms-label">Platforms</span>
      ${asset.platforms.map((p) => `<span class="compat-platform">${p}</span>`).join("")}
    </div>` : "";

  const compatContent = compatTable + compatPlatforms;

  // ── Dependencies ──
  const pkgIcon = `<svg class="dep-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;

  const depsHTML = (asset.dependencies && asset.dependencies.length) ? `
    <div class="deps-table">
      <div class="deps-thead">
        <div class="deps-th deps-th--name">Dependency</div>
        <div class="deps-th">Version</div>
        <div class="deps-th">Required</div>
      </div>
      <div class="deps-tbody">
        ${asset.dependencies.map((d) => {
          const name    = typeof d === "string" ? d : d.name;
          const version = typeof d === "object" && d.version ? d.version : null;
          const opt     = typeof d === "object" && d.required === false;
          const url     = typeof d === "object" && d.url ? d.url : null;
          const nameEl  = url
            ? `<a class="dep-name link-animated" href="${url}" target="_blank" rel="noopener">${name}</a>`
            : `<span class="dep-name">${name}</span>`;
          return `
          <div class="deps-tr">
            <div class="deps-td deps-td--name">${pkgIcon}${nameEl}</div>
            <div class="deps-td deps-td--version">${version ? version : `<span class="dep-na">—</span>`}</div>
            <div class="deps-td"><span class="dep-status ${opt ? "dep-status--opt" : "dep-status--req"}">${opt ? "Optional" : "Required"}</span></div>
          </div>`;
        }).join("")}
      </div>
    </div>` : "";

  // ── Quick Start ── (escapeHtml, ICON_COPY from utils.js)

  const quickStartHTML = asset.quickStart
    ? `<div class="code-block">
        <button class="code-copy-btn" aria-label="Copy code">${ICON_COPY}</button>
        <pre><code class="language-csharp">${escapeHtml(asset.quickStart)}</code></pre>
      </div>`
    : "";

  const screenshots = (asset.screenshots || []).map((src, i) => {
    const ytId = getYouTubeId(src);
    const thumb = ytId
      ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
      : src;

    return `
      <div class="screenshot-item${ytId ? " screenshot-item--video" : ""}" data-index="${i}">
        <img src="${thumb}" alt="${asset.name}" loading="lazy" onerror="this.style.display='none'">
        ${ytId ? `
        <div class="screenshot-play-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>` : ""}
      </div>`;
  }).join("");

  // ── Related assets ──
  const related = ASSETS
    .filter((a) => a.id !== asset.id)
    .map((a) => ({
      asset: a,
      score: a.tags.filter((t) => asset.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.asset);

  const relatedCards = related.map((r) => {
    const rTags = renderTags(r.tags);
    const rPrice = r.salePrice
      ? `<span class="related-price-original">${r.price}</span><span class="related-price-sale">${formatSalePrice(r.salePrice)}</span>`
      : `<span class="related-price">${r.price}</span>`;
    return `
      <a class="related-card" href="asset.html?id=${r.id}">
        <div class="related-card-thumb">
          <img src="${r.thumb}" alt="${r.name}" loading="lazy" onerror="this.parentElement.classList.add('no-img')">
        </div>
        <div class="related-card-body">
          <div class="related-card-tags">${rTags}</div>
          <p class="related-card-name">${r.name}</p>
          <p class="related-card-price">${rPrice}</p>
        </div>
      </a>`;
  }).join("");

  const relatedSection = related.length ? `
    <div class="asset-section asset-section--related">
      <h2 class="asset-section-title asset-section-title--related">You might also like</h2>
      <div class="related-grid">${relatedCards}</div>
    </div>` : "";

  // ── Price display ──
  const priceHTML = asset.salePrice
    ? `<span class="asset-price-original">${asset.price}</span><span class="asset-price-sale">${formatSalePrice(asset.salePrice)}</span>`
    : `<span class="asset-price">${asset.price}</span>`;

  main.innerHTML = `
    <a class="asset-back" href="index.html">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      All assets
    </a>
    <div class="asset-hero">
      <div class="asset-hero-content">
        <h1 class="asset-hero-name">${asset.name}</h1>
        <div class="asset-hero-tags">${tags}</div>
        <p class="asset-hero-desc">${asset.longDescription || asset.description}</p>
        <div class="asset-hero-meta">
          ${asset.version ? `<span class="asset-meta-item">v${asset.version}</span>` : ""}
          ${asset.unity ? `<span class="asset-meta-item">Unity ${asset.unity}</span>` : ""}
        </div>
        <div class="asset-hero-price">${priceHTML}</div>
        <div class="asset-hero-actions">
          <a class="asset-btn-primary" href="${asset.storeUrl}" target="_blank" rel="noopener">Buy on Asset Store</a>
          ${asset.docsPage ? `<a class="asset-btn-ghost" href="${asset.docsPage}">Documentation</a>` : ""}
          ${asset.changelog ? `<a class="asset-btn-ghost" href="changelog.html?id=${asset.id}">Changelog</a>` : ""}
        </div>
      </div>
      <div class="asset-hero-image">
        <img src="${asset.thumb}" alt="${asset.name}" onerror="this.parentElement.classList.add('no-img')">
      </div>
    </div>
    
        ${screenshots ? `
    <div class="asset-section">
      <h2 class="asset-section-title">Screenshots</h2>
      <div class="screenshots-grid">${screenshots}</div>
    </div>` : ""}

    ${features || compatContent || depsHTML ? `
    <div class="asset-info-grid">
      ${features ? `
      <div class="asset-section asset-section--features">
        <h2 class="asset-section-title">Features</h2>
        <ul class="features-list">${features}</ul>
      </div>` : ""}
      ${compatContent || depsHTML ? `
      <div class="asset-section asset-section--compat">
        ${compatContent ? `
        <h2 class="asset-section-title">Compatibility</h2>
        ${compatContent}` : ""}
        ${depsHTML ? `
        <div class="asset-deps">
          <h2 class="asset-section-title">Dependencies</h2>
          ${depsHTML}
        </div>` : ""}
      </div>` : ""}
    </div>` : ""}

    ${quickStartHTML ? `
    <div class="asset-section asset-quickstart">
      <h2 class="asset-section-title">Quick Start</h2>
      ${quickStartHTML}
    </div>` : ""}

    ${relatedSection}
  `;

  // ── Lightbox ──
  const srcs = asset.screenshots || [];
  if (!srcs.length) return;

  let current = 0;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <button class="lightbox-close" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <button class="lightbox-prev" aria-label="Previous">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="lightbox-next" aria-label="Next">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <div class="lightbox-media-wrap">
      <img class="lightbox-img" src="" alt="">
      <iframe class="lightbox-video" src="" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
    </div>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(lightbox);

  const lbImg    = lightbox.querySelector(".lightbox-img");
  const lbVideo  = lightbox.querySelector(".lightbox-video");
  const counter  = lightbox.querySelector(".lightbox-counter");
  const btnClose = lightbox.querySelector(".lightbox-close");
  const btnPrev  = lightbox.querySelector(".lightbox-prev");
  const btnNext  = lightbox.querySelector(".lightbox-next");
  const backdrop = lightbox.querySelector(".lightbox-backdrop");

  function show(index) {
    current = (index + srcs.length) % srcs.length;
    const src = srcs[current];
    const ytId = getYouTubeId(src);

    if (ytId) {
      lbImg.style.display = "none";
      lbVideo.style.display = "block";
      lbVideo.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    } else {
      lbVideo.style.display = "none";
      lbVideo.src = "";
      lbImg.style.display = "block";
      lbImg.src = src;
    }

    counter.textContent = `${current + 1} / ${srcs.length}`;
    btnPrev.style.display = srcs.length < 2 ? "none" : "";
    btnNext.style.display = srcs.length < 2 ? "none" : "";
  }

  function open(index) {
    show(index);
    lightbox.classList.add("lightbox--open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("lightbox--open");
    lbVideo.src = "";
    document.body.style.overflow = "";
  }

  main.querySelectorAll(".screenshot-item").forEach((el) => {
    el.addEventListener("click", () => open(parseInt(el.dataset.index, 10)));
  });

  btnClose.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  btnPrev.addEventListener("click", () => show(current - 1));
  btnNext.addEventListener("click", () => show(current + 1));

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("lightbox--open")) return;
    if (e.key === "Escape")     close();
    if (e.key === "ArrowLeft")  show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // ── Syntax highlighting for Quick Start ──
  if (window.hljs) {
    main.querySelectorAll("pre code").forEach((el) => hljs.highlightElement(el));
  }

  // ── Copy button ── (uses shared setupCopyButton from utils.js)
  main.querySelectorAll(".code-copy-btn").forEach((btn) => {
    setupCopyButton(
      btn,
      () => btn.closest(".code-block").querySelector("code").innerText,
      "code-copy-btn--copied",
      2000,
    );
  });
});
