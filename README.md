# fe1zed Website

Official website for **fe1zed** — professional Unity Editor tools built with a focus on quality, performance, and developer experience.

This site showcases products, provides support and essential information, and links to external platforms such as the Unity Asset Store.

---

## About

The fe1zed website serves as a clean, focused landing space for Unity developers to discover tools, explore product pages, and access support resources.

---

## Structure

Plain HTML, CSS and ES modules — no build step. GitHub Pages serves the repo as-is.
Serve locally over HTTP (modules don't load from `file://`), e.g. `python3 -m http.server`.

```
css/
  tokens.css        design tokens — every colour, radius and font lives here
  base.css          reset, document defaults, .page container
  layout.css        site nav + footer
  components.css    shared UI: buttons, chips, cards, price, tables, code blocks, modals, forms
  pages/*.css       one file per page; positions components, never restyles them
js/
  data/assets.js    product catalogue — drives cards, asset pages, changelogs, docs
  data/showcase.js  reviewed showcase entries
  lib/              framework-free helpers (escaping templates, formatting, meta, forms, icons)
  components/       reusable UI (<site-nav>/<site-footer>, cards, changelog, lightbox, dropdown, code blocks)
  pages/*.js        one entry module per page
docs/*.html         hand-written docs; <body data-asset="…"> links them to their asset
```

Adding a product: add an entry to `js/data/assets.js` (the fields are documented at the top of the file), put images in `img/<Name>/` as `.webp`, and optionally a `docs/<id>.html` page.

---

© 2026 fe1zed. All rights reserved.
Unity is a trademark of Unity Technologies. This site is not affiliated with Unity.
