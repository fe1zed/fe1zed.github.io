/**
 * The site's paper plane: one flat, top-down dart pointing along +x, shared by
 * the canvas planes (paper-planes.js) and inline SVG icons, so an icon and a
 * flying plane are the same shape. Symmetric, so it never needs flipping;
 * stroking the outline in the fill colour rounds its corners.
 */
export const PLANE = [[12, 0], [-10, -9], [-5, 0], [-10, 9]];
export const PLANE_OUTLINE = 3;
export const FOLD = [[9, 0], [-4, 0]];
export const FOLD_WIDTH = 1.4;

/**
 * The plane as an inline SVG string, centred on the plane's origin (so the
 * element's centre is the plane's centre). The dart is currentColor; style the
 * fold with `.<className>-fold { stroke: … }`.
 */
export function planeSvg(className) {
  const dart = PLANE.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("") + "Z";
  const [[fx0, fy0], [fx1, fy1]] = FOLD;
  return `<svg class="${className}" viewBox="-14 -11 28 22" aria-hidden="true" focusable="false">`
    + `<path d="${dart}" fill="currentColor" stroke="currentColor" stroke-width="${PLANE_OUTLINE}" stroke-linejoin="round"/>`
    + `<path class="${className}-fold" d="M${fx0} ${fy0}L${fx1} ${fy1}" stroke-width="${FOLD_WIDTH}" stroke-linecap="round"/>`
    + `</svg>`;
}
