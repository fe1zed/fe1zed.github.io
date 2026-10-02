import "../components/site-chrome.js";
import { submitForm } from "../lib/forms.js";
import { startPaperPlanes } from "../components/paper-planes.js";

const form = document.getElementById("contact-form");
const button = form.querySelector('[type="submit"]');
const success = document.getElementById("form-success");
const error = document.getElementById("form-error");

// Native constraint validation runs before this fires (the form isn't novalidate).
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "Sending…";
  success.hidden = true;
  error.hidden = true;

  const ok = await submitForm(form);
  if (ok) form.reset();
  (ok ? success : error).hidden = false;

  button.disabled = false;
  button.textContent = label;
});

/* -- Paper airplanes drifting behind the page -- */
startPaperPlanes(document.getElementById("contact-planes"), {
  maxPlanes: window.matchMedia("(max-width: 720px)").matches ? 2 : 3,
});
