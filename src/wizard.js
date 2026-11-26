import { byId, initDialog, showDialog } from "./dom.js";
import { saveManifest, validateDraft } from "./ledger.js";

/** @param {(reference: string) => void} openTracker */
export function initWizard(openTracker) {
  const form = byId("wizard-form", HTMLFormElement);
  const name = byId("manifest-name", HTMLInputElement);
  const cep = byId("manifest-cep", HTMLInputElement);
  const consent = byId("manifest-consent", HTMLInputElement);
  const error = byId("wizard-error", HTMLElement);
  const result = byId("modal-success", HTMLDialogElement);
  const reference = byId("hash-display", HTMLElement);
  const copyStatus = byId("copy-status", HTMLElement);
  const progress = byId("wizard-bar", HTMLElement);
  const panels = Array.from(form.querySelectorAll(".wizard-step"));
  const indicators = Array.from(document.querySelectorAll(".step-indicator"));
  const options = Array.from(
    form.querySelectorAll('input[name="category"]'),
  ).filter((input) => input instanceof HTMLInputElement);
  const warnings = {
    name: "Informe um nome fictício com 2 a 80 caracteres.",
    cep: "Informe um CEP de exemplo com oito dígitos.",
    category: "Selecione pelo menos uma categoria de mídia.",
    consent: "Confirme que entende que este é um teste local.",
  };
  let step = 0;
  let savedReference = "";

  function readDraft() {
    return {
      name: name.value,
      cep: cep.value,
      items: options
        .filter((input) => input.checked)
        .map((input) => input.value),
      consent: consent.checked,
    };
  }

  /** @param {boolean} focus */
  function render(focus) {
    panels.forEach((panel, index) => {
      panel.toggleAttribute("inert", index !== step);
      panel.classList.toggle("active", index === step);
    });
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("step-current", index === step);
      indicator.classList.toggle("step-complete", index < step);
      if (index === step) indicator.setAttribute("aria-current", "step");
      else indicator.removeAttribute("aria-current");
    });
    progress.style.width = step * 50 + "%";
    if (focus) panels[step].querySelector("h3")?.focus();
  }

  function clearError() {
    error.textContent = "";
    form
      .querySelectorAll('[aria-invalid="true"]')
      .forEach((field) => field.removeAttribute("aria-invalid"));
  }

  function advance() {
    if (result.open) return;
    clearError();
    const draft = readDraft();
    const issue = validateDraft(draft);
    const invalidStep =
      issue === "name" || issue === "cep" ? 0 : issue === "category" ? 1 : 2;
    if (issue && invalidStep <= step) {
      if (step !== invalidStep) {
        step = invalidStep;
        render(false);
      }
      const field =
        issue === "name"
          ? name
          : issue === "cep"
            ? cep
            : issue === "consent"
              ? consent
              : options[0];
      field.setAttribute("aria-invalid", "true");
      error.textContent = warnings[issue];
      field.focus();
      return;
    }
    if (step < panels.length - 1) {
      step++;
      render(true);
      return;
    }
    try {
      savedReference = saveManifest(window.localStorage, draft).reference;
    } catch {
      error.textContent =
        "Não foi possível salvar neste navegador. Verifique o armazenamento local e tente novamente.";
      return;
    }
    reference.textContent = savedReference;
    copyStatus.textContent = "";
    showDialog(result);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    advance();
  });
  form.addEventListener("input", clearError);
  form
    .querySelectorAll('[data-action="wizard-next"]')
    .forEach((button) => button.addEventListener("click", advance));
  form.querySelectorAll('[data-action="wizard-prev"]').forEach((button) => {
    button.addEventListener("click", () => {
      clearError();
      step--;
      render(true);
    });
  });
  initDialog(result);
  byId("consult-reference", HTMLButtonElement).addEventListener("click", () =>
    result.close("consultar"),
  );
  result.addEventListener("close", () => {
    const follow = result.returnValue === "consultar";
    result.returnValue = "";
    form.reset();
    step = 0;
    clearError();
    render(!follow);
    if (follow) openTracker(savedReference);
  });
  byId("copy-reference", HTMLButtonElement).addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(savedReference);
        copyStatus.textContent = "Código copiado.";
      } catch {
        copyStatus.textContent =
          "Não foi possível copiar. Selecione e copie o código manualmente.";
      }
    },
  );
  render(false);
}
