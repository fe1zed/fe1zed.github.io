async function loadPartial(id, path) {
    const el = document.getElementById(id);
    if (!el) return;

    const res = await fetch(path);
    el.innerHTML = await res.text();
}

// loadPartial("site-header", "/partials/header.html");
loadPartial("site-footer", "/partials/footer.html");
