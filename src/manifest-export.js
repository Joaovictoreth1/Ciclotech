/** @typedef {Omit<import("./ledger.js").Manifest, "items"> & {items: readonly string[]}} ExportableManifest */

/** @param {ExportableManifest} manifest */
export function formatManifest(manifest) {
  const name = manifest.name.replace(/\s+/g, " ").trim();
  return [
    "Ciclotech — Manifesto de demonstração",
    "Registro local; não comprova coleta, transporte ou reciclagem.",
    "",
    `Referência: ${manifest.reference}`,
    `Data: ${manifest.date}`,
    `Organização: ${name}`,
    `CEP: ${manifest.cep}`,
    "",
    "Categorias:",
    ...manifest.items.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

/** @param {ExportableManifest} manifest */
export function downloadManifest(manifest) {
  const file = new Blob([formatManifest(manifest)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ciclotech-${manifest.reference}.txt`;
  document.body.append(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
