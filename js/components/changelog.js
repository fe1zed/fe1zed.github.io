import { html, raw } from "../lib/html.js";
import { pluralize } from "../lib/format.js";

const GROUPS = [
  ["added", "Added"],
  ["changed", "Changed"],
  ["fixed", "Fixed"],
];

/** Newest first. ISO dates sort lexicographically. */
export const sortedReleases = (asset) =>
  [...(asset?.changelog ?? [])].sort((a, b) => b.date.localeCompare(a.date));

const list = (items) => html`<ul>${items.map((item) => html`<li>${raw(item)}</li>`)}</ul>`;

/**
 * Body of one release. Supports grouped entries (added/changed/fixed) and the
 * older flat `items` shape. Items are trusted HTML from assets.js.
 */
export function releaseBody(release) {
  const groups = GROUPS.filter(([key]) => release[key]?.length);
  if (!groups.length) return list(release.items ?? []);
  return groups.map(([key, label]) => html`
    <div class="changelog-group-label">${label}</div>
    ${list(release[key])}`);
}

/** "4 releases · 18 added · 11 changed · 2 fixed". Flat items count as "added". */
export function releaseSummary(releases) {
  const count = (key) => releases.reduce((sum, r) => sum + (r[key]?.length ?? 0), 0);
  const parts = [pluralize(releases.length, "release")];
  const added = count("added") + count("items");
  const changed = count("changed");
  const fixed = count("fixed");
  if (added) parts.push(`${added} added`);
  if (changed) parts.push(`${changed} changed`);
  if (fixed) parts.push(`${fixed} fixed`);
  return parts.join(" · ");
}
