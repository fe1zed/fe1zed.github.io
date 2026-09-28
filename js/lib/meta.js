export const SITE_URL = "https://fe1zed.github.io/";

/** Absolute URL for a site-relative path (og:image / og:url need absolute URLs). */
export const absoluteUrl = (path) => new URL(path, SITE_URL).href;

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.setAttribute("content", content);
}

/** Sets the document title plus the matching description / Open Graph / Twitter tags. */
export function setPageMeta({ title, description, image, url, type }) {
  if (title) {
    document.title = title;
    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);
  }
  if (description) {
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:description", description);
  }
  if (image) {
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:image", image);
  }
  if (url)  upsertMeta("property", "og:url", url);
  if (type) upsertMeta("property", "og:type", type);
}
