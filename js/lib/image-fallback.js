/**
 * One capture-phase listener replaces the inline onerror="" handlers.
 *
 *   <img data-fallback-src="…">  → first error swaps to that URL (YouTube maxres → hq)
 *   otherwise                    → the closest [data-thumb] gets .no-img, which the
 *                                  CSS turns into a "No preview" placeholder
 */
let installed = false;

export function installImageFallbacks() {
  if (installed) return;
  installed = true;

  document.addEventListener("error", (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;

    const fallback = img.dataset.fallbackSrc;
    if (fallback) {
      delete img.dataset.fallbackSrc;
      img.src = fallback;
      return;
    }
    img.closest("[data-thumb]")?.classList.add("no-img");
  }, true);
}
