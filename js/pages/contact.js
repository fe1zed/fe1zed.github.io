import "../components/site-chrome.js";
import { submitForm } from "../lib/forms.js";
import { startPaperPlanes, planeSvg } from "../components/paper-planes.js";

const SENT_MS = 2600;        // how long the button says "Sent" before it's ready again
const FAILED_MS = 1100;      // red + shake, then it fades back to white
const TILT = -0.45;          // radians: the icon's nose-up angle, and the takeoff heading

const form = document.getElementById("contact-form");
const button = form.querySelector(".send-btn");
const icon = button.querySelector(".send-btn-icon");
const status = document.getElementById("form-status");
const error = document.getElementById("form-error");

/* -- Paper airplanes: ambient ones drift behind the page; the Send icon takes off over it -- */
const isPhone = window.matchMedia("(max-width: 720px)").matches;
startPaperPlanes(document.getElementById("contact-planes"), { maxPlanes: isPhone ? 2 : 3 });

const launchCanvas = document.getElementById("contact-launch");
const launcher = startPaperPlanes(launchCanvas, { ambient: false });

icon.innerHTML = planeSvg("send-btn-plane");
const iconPlane = icon.firstElementChild;
iconPlane.style.rotate = `${TILT}rad`;

/** idle | sending | sent | failed. Busy states block resubmits without dropping keyboard focus. */
function setState(state) {
  button.dataset.state = state;
  button.setAttribute("aria-disabled", String(state !== "idle"));
}

/**
 * Launch a canvas plane from exactly where the icon sits, at the icon's size
 * and angle. Over the button it keeps the button's colours, so the icon
 * itself appears to leave. Measured on the untransformed wrapper, so the
 * bobbing animation doesn't shift the start point.
 */
function takeOff() {
  if (!launcher) return;
  const sky = launchCanvas.getBoundingClientRect();
  const from = icon.getBoundingClientRect();
  const box = button.getBoundingClientRect();
  const style = getComputedStyle(button);
  launcher.launch(from.left + from.width / 2 - sky.left, from.top + from.height / 2 - sky.top, {
    heading: TILT,
    fromScale: from.width / iconPlane.viewBox.baseVal.width,
    cover: {
      x: box.left - sky.left,
      y: box.top - sky.top,
      width: box.width,
      height: box.height,
      radius: parseFloat(style.borderTopLeftRadius) || 0,
      // The colour tokens, not the painted colours, in case a fade back from red is still running.
      ink: style.getPropertyValue("--send-ink").trim(),
      paper: style.getPropertyValue("--send-bg").trim(),
    },
  });
}

// Native constraint validation runs before this fires (the form isn't novalidate),
// so an empty or malformed field is flagged by the browser and never gets here.
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (button.dataset.state !== "idle") return;

  setState("sending");
  error.textContent = "";
  status.textContent = "Sending your message…";

  const ok = await submitForm(form);
  if (!ok) {
    // The red shake is the visible signal; the hidden alert says it in words.
    setState("failed");
    status.textContent = "";
    error.textContent = "Your message couldn't be sent. Please try again.";
    setTimeout(() => setState("idle"), FAILED_MS);
    return;
  }

  form.reset();
  takeOff();                 // before "sent" hides the icon, so the hand-off is seamless
  setState("sent");
  status.textContent = "Message sent. I'll get back to you soon.";
  setTimeout(() => setState("idle"), SENT_MS);
});
