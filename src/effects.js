import { byId } from "./dom.js";

/** @param {MediaQueryList} motion */
function initNetwork(motion) {
  const canvas = byId("network-canvas", HTMLCanvasElement);
  const context = canvas.getContext("2d");
  if (!context) return;
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;
  const particles = Array.from({ length: innerWidth < 768 ? 32 : 56 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7,
    r: 0.5 + Math.random() * 1.5,
  }));

  function resize() {
    if (!context) return;
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /** @param {number} timestamp */
  function draw(timestamp) {
    if (!context) return;
    frame = requestAnimationFrame(draw);
    if (timestamp - last < 30) return;
    last = timestamp;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(0, 255, 163, 0.5)";
    context.lineWidth = 0.5;
    for (const [index, particle] of particles.entries()) {
      particle.x = (particle.x + particle.vx + width) % width;
      particle.y = (particle.y + particle.vy + height) % height;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fill();
      for (let neighbor = index + 1; neighbor < particles.length; neighbor++) {
        const other = particles[neighbor];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const square = dx * dx + dy * dy;
        if (square >= 14400) continue;
        context.beginPath();
        context.strokeStyle = `rgba(0, 255, 163, ${0.16 * (1 - square / 14400)})`;
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }
  }

  function sync() {
    cancelAnimationFrame(frame);
    if (!motion.matches && !document.hidden) {
      frame = requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  motion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  sync();
}

export function initEffects() {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)");
  initNetwork(motion);

  const header = byId("nav-header", HTMLElement);
  const dot = byId("cursor-dot", HTMLElement);
  const ring = byId("cursor-ring", HTMLElement);
  const scene = byId("3d-scene", HTMLElement);
  const card = byId("3d-card", HTMLElement);
  let pointerFrame = 0;

  const updateHeader = () =>
    header.classList.toggle("header-scrolled", scrollY > 50);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  document.addEventListener(
    "pointermove",
    (event) => {
      if (
        !finePointer.matches ||
        motion.matches ||
        event.pointerType !== "mouse"
      ) {
        return;
      }
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        document.body.classList.add("custom-cursor-active");
        document.body.classList.toggle(
          "magnetic-hover",
          event.target instanceof Element &&
            !!event.target.closest(".interactive, a, button, input, label"),
        );
        for (const cursor of [dot, ring]) {
          cursor.style.left = event.clientX + "px";
          cursor.style.top = event.clientY + "px";
        }
      });
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () =>
    document.body.classList.remove("custom-cursor-active"),
  );
  scene.addEventListener(
    "pointermove",
    (event) => {
      if (!finePointer.matches || motion.matches) return;
      const bounds = scene.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -10;
      card.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
    },
    { passive: true },
  );
  scene.addEventListener("pointerleave", () =>
    card.style.removeProperty("transform"),
  );

  const terminal = byId("terminal-logs", HTMLElement);
  for (const label of [
    "Modo de demonstração",
    "Dados no navegador",
    "Indicadores ESG fictícios",
  ]) {
    const row = document.createElement("div");
    row.textContent = "> " + label;
    terminal.append(row);
  }
}
