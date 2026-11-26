import { byId } from "./dom.js";
import { findManifest, normalizeReference } from "./ledger.js";
import { downloadManifest } from "./manifest-export.js";

/** @param {import("./ledger.js").Records} temporaryRecords */
export function initTracker(temporaryRecords) {
  const input = byId("hash-input", HTMLInputElement);
  const form = byId("tracker-form", HTMLFormElement);
  const status = byId("tracker-status", HTMLElement);
  const empty = byId("state-empty", HTMLElement);
  const output = byId("state-result", HTMLElement);
  const download = byId("download-manifest", HTMLButtonElement);
  const fields = {
    reference: byId("res-hash", HTMLElement),
    name: byId("res-name", HTMLElement),
    cep: byId("res-cep", HTMLElement),
    items: byId("res-items", HTMLElement),
    date: byId("res-date", HTMLElement),
  };

  /** @type {ReturnType<typeof findManifest>} */
  let current = null;

  function clearResult() {
    current = null;
    output.hidden = true;
    empty.hidden = false;
    input.removeAttribute("aria-invalid");
  }

  function search() {
    clearResult();
    const reference = normalizeReference(input.value);
    if (!reference) {
      input.setAttribute("aria-invalid", "true");
      status.textContent = "Informe um código no formato CT-A1B2-C3D4.";
      return;
    }

    try {
      const result =
        findManifest(temporaryRecords, reference) ??
        findManifest(window.localStorage, reference);
      if (!result) {
        status.textContent = "Código não encontrado neste navegador.";
        return;
      }
      fields.reference.textContent = result.reference;
      fields.name.textContent = result.name;
      fields.cep.textContent = result.cep;
      fields.items.textContent = result.items.join(", ");
      fields.date.textContent = result.date;
      current = result;
      empty.hidden = true;
      output.hidden = false;
      status.textContent = "Manifesto de demonstração encontrado.";
    } catch {
      status.textContent =
        "Não foi possível consultar o armazenamento deste navegador.";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    search();
  });
  input.addEventListener("input", () => {
    clearResult();
    status.textContent = "";
  });
  download.addEventListener("click", () => {
    if (!current) return;
    try {
      downloadManifest(current);
      status.textContent = "Arquivo de demonstração preparado para download.";
    } catch {
      status.textContent =
        "Não foi possível preparar o arquivo de demonstração.";
    }
  });

  /** @param {string} reference */
  return (reference) => {
    input.value = reference;
    search();
    input.focus();
  };
}
