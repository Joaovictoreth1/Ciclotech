import { byId, initDialog, showDialog } from "./dom.js";

export function initTelemetry() {
  const dialog = byId("modal-telemetry", HTMLDialogElement);
  const status = byId("chart-status", HTMLElement);
  /** @type {(() => void) | undefined} */
  let destroy;
  let sequence = 0;

  initDialog(dialog);
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    sequence++;
    destroy?.();
    destroy = undefined;
  });
  dialog
    .querySelector('[data-action="telemetry-close"]')
    ?.addEventListener("click", () => dialog.close());
  document
    .querySelector('[data-action="telemetry-open"]')
    ?.addEventListener("click", async () => {
      if (dialog.open) return;
      showDialog(dialog);
      const current = ++sequence;
      status.textContent = "Carregando gráficos de exemplo…";
      try {
        const { renderCharts } = await import("./charts.js");
        if (dialog.open && current === sequence) {
          destroy = renderCharts();
          status.textContent = "";
        }
      } catch {
        if (dialog.open && current === sequence) {
          status.textContent = "Os gráficos não puderam ser carregados.";
        }
      }
    });
}
