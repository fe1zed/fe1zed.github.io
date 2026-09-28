/**
 * Posts a form to its own action (Formspree) as JSON-accepting AJAX and
 * resolves to true on success. Network errors resolve to false, so callers
 * handle a single outcome. The HTML keeps method/action, so the forms still
 * work as plain POSTs if the module never loads.
 */
export async function submitForm(form, data = new FormData(form)) {
  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Live "n / max" counters: <span class="form-char-count" data-count-for="field-id">.
 * The limit comes from the field's maxlength; the counter warms up in the last 10%.
 */
export function initCharCounters(root = document) {
  for (const counter of root.querySelectorAll("[data-count-for]")) {
    const field = document.getElementById(counter.dataset.countFor);
    const max = field?.maxLength;
    if (!field || !(max > 0)) continue;

    const update = () => {
      const length = field.value.length;
      counter.textContent = `${length} / ${max}`;
      counter.classList.toggle("form-char-count--near", length >= Math.round(max * 0.9));
      counter.classList.toggle("form-char-count--full", length >= max);
    };
    field.addEventListener("input", update);
    update();
  }
}

/** Marks a .form-group invalid with a message, or clears it when message is empty. */
export function setGroupError(group, message) {
  if (!group) return;
  group.classList.toggle("form-group--error", Boolean(message));
  let el = group.querySelector(".form-error-msg");
  if (!el) {
    el = document.createElement("span");
    el.className = "form-error-msg";
    el.setAttribute("role", "alert");
    group.append(el);
  }
  el.textContent = message || "";
}

/** Plays the submit-button shake once. */
export function shake(button) {
  button.classList.remove("btn--shake");
  void button.offsetWidth; // restart the animation if it's already applied
  button.classList.add("btn--shake");
  button.addEventListener("animationend", () => button.classList.remove("btn--shake"), { once: true });
}
