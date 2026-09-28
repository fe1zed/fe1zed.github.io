import { icons } from "../lib/icons.js";

const COPIED_MS = 2000;

function addCopyButton(block) {
  const code = block.querySelector("code") ?? block.querySelector("pre");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-btn";
  button.setAttribute("aria-label", "Copy code");
  button.innerHTML = icons.copy();

  let timer;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.innerText);
    } catch {
      return; // clipboard blocked (insecure context / permissions) — leave the button as is
    }
    clearTimeout(timer);
    button.innerHTML = icons.check();
    button.classList.add("is-copied");
    timer = setTimeout(() => {
      button.innerHTML = icons.copy();
      button.classList.remove("is-copied");
    }, COPIED_MS);
  });

  block.append(button);
}

/**
 * Wraps every <pre> under root in a .code-block with a copy button and runs
 * highlight.js on it when the (deferred, optional) CDN script is available.
 */
export function enhanceCodeBlocks(root = document) {
  for (const pre of root.querySelectorAll("pre")) {
    if (pre.parentElement.classList.contains("code-block")) continue;

    const block = document.createElement("div");
    block.className = "code-block";
    pre.before(block);
    block.append(pre);
    addCopyButton(block);

    const code = pre.querySelector("code");
    if (code && window.hljs) window.hljs.highlightElement(code);
  }
}
