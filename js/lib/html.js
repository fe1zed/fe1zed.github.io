/**
 * Tiny escaping template layer.
 *
 * `html` is a tagged template: every interpolated value is HTML-escaped unless
 * it is itself the result of `html` or `raw`. Arrays are flattened, and
 * null / undefined / false render as nothing, so `${cond && html`…`}` and
 * `${items.map(…)}` work without manual joins.
 */
class SafeHtml {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Marks a string as trusted markup (asset data authored in this repo, SVG icons). */
export const raw = (value) => new SafeHtml(String(value));

function serialize(value) {
  if (value == null || value === false) return "";
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join("");
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += serialize(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

/** Replaces an element's children with rendered markup. */
export function render(target, content) {
  target.innerHTML = serialize(content);
  return target;
}

/** Renders markup into a detached element and returns its first child. */
export function toElement(content) {
  const template = document.createElement("template");
  template.innerHTML = serialize(content).trim();
  return template.content.firstElementChild;
}
