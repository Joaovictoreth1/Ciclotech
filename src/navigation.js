import { byId } from "./dom.js";

export function initMobileMenu() {
  const menu = byId("menu-mobile", HTMLDetailsElement);
  const toggle = menu.querySelector("summary");
  const desktop = matchMedia("(min-width: 1024px)");

  desktop.addEventListener("change", () => {
    if (desktop.matches) menu.open = false;
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.open) return;
    event.preventDefault();
    menu.open = false;
    toggle?.focus();
  });
  menu.addEventListener("click", (event) => {
    if (
      !(event.target instanceof HTMLAnchorElement) ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }
    const section = document.getElementById(event.target.hash.slice(1));
    if (!section) return;
    menu.open = false;
    section.focus({ preventScroll: true });
  });
}

export function initMap() {
  const load = byId("map-load", HTMLButtonElement);
  const map = byId("demo-map", HTMLIFrameElement);
  const placeholder = byId("map-placeholder", HTMLElement);
  const status = byId("map-status", HTMLElement);

  load.hidden = false;
  load.addEventListener("click", () => {
    const src = map.dataset.src;
    if (!src) {
      status.textContent = "Mapa incorporado indisponível. Use o mapa externo.";
      return;
    }
    map.src = src;
    map.hidden = false;
    map.focus();
    placeholder.hidden = true;
  });
}
