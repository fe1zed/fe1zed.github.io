import { html, toElement } from "../lib/html.js";
import { icons } from "../lib/icons.js";
import { youTubeId } from "../lib/format.js";

/**
 * Full-screen gallery for images and YouTube links.
 * One instance per gallery; the DOM is created lazily on first open.
 */
export class Lightbox {
  #sources;
  #index = 0;
  #el = null;
  #returnFocus = null;

  constructor(sources) {
    this.#sources = sources;
  }

  open(index) {
    this.#ensureDom();
    this.#returnFocus = document.activeElement;
    this.#show(index);
    this.#el.classList.add("modal--open");
    this.#el.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    this.#el.querySelector(".lightbox-close").focus();
  }

  close() {
    this.#el.classList.remove("modal--open");
    this.#el.setAttribute("aria-hidden", "true");
    this.#video.src = "";
    document.body.style.overflow = "";
    this.#returnFocus?.focus();
  }

  get isOpen() { return this.#el?.classList.contains("modal--open") ?? false; }
  get #image() { return this.#el.querySelector(".lightbox-img"); }
  get #video() { return this.#el.querySelector(".lightbox-video"); }

  #show(index) {
    const count = this.#sources.length;
    this.#index = (index + count) % count;
    const src = this.#sources[this.#index];
    const videoId = youTubeId(src);

    this.#image.hidden = Boolean(videoId);
    this.#video.hidden = !videoId;
    this.#video.src = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
    if (!videoId) this.#image.src = src;

    this.#el.querySelector(".lightbox-counter").textContent = `${this.#index + 1} / ${count}`;
  }

  #ensureDom() {
    if (this.#el) return;
    const single = this.#sources.length < 2;

    this.#el = toElement(html`
      <div class="modal lightbox" role="dialog" aria-modal="true" aria-label="Media viewer" aria-hidden="true">
        <div class="modal-backdrop" data-action="close"></div>
        <button class="lightbox-btn lightbox-close" type="button" aria-label="Close" data-action="close">${icons.close()}</button>
        <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous" data-action="prev" ${single && "hidden"}>${icons.chevronLeft(20)}</button>
        <button class="lightbox-btn lightbox-next" type="button" aria-label="Next" data-action="next" ${single && "hidden"}>${icons.chevronRight(20)}</button>
        <div class="lightbox-media">
          <img class="lightbox-img" alt="">
          <iframe class="lightbox-video" title="Video" allow="autoplay; fullscreen" allowfullscreen hidden></iframe>
        </div>
        <div class="lightbox-counter"></div>
      </div>`);

    this.#el.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (action === "close") this.close();
      if (action === "prev") this.#show(this.#index - 1);
      if (action === "next") this.#show(this.#index + 1);
    });

    document.addEventListener("keydown", (e) => {
      if (!this.isOpen) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.#show(this.#index - 1);
      if (e.key === "ArrowRight") this.#show(this.#index + 1);
    });

    document.body.append(this.#el);
  }
}
