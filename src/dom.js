/** @template {HTMLElement} T @param {string} id @param {new (...args: never[]) => T} type */
export function byId(id, type) {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`Elemento ausente ou inválido: ${id}`);
  }
  return element;
}

/** @param {HTMLDialogElement} dialog */
export function initDialog(dialog) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && event.detail === 1) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) {
      document.body.classList.remove("dialog-open");
    }
  });
}

/** @param {HTMLDialogElement} dialog */
export function showDialog(dialog) {
  if (dialog.open) return;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}
