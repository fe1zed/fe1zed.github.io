/** "$19.99" → 19.99; anything unparsable → 0. */
export const parsePrice = (price) => parseFloat(String(price ?? "").replace(/[^0-9.]/g, "")) || 0;

/** "$0" → "Free", otherwise unchanged. */
export const formatSalePrice = (price) => (parsePrice(price) === 0 ? "Free" : price);

/**
 * "2026-04-09" → "April 9, 2026".
 * Dates are calendar dates, not instants: format in UTC so a visitor west of
 * Greenwich doesn't see the previous day.
 */
export const formatLongDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

/** "1.3.0" → "v1-3-0" (usable as an element id / URL fragment). */
export const versionAnchor = (version) => `v${version.replaceAll(".", "-")}`;

/** Video id from a youtube.com/watch?v= or youtu.be/ URL, else null. */
export const youTubeId = (url) =>
  url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] ?? null;

export const pluralize = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
