import { expect, test } from "vitest";
import { example } from "../../src/ledger.js";
import { formatManifest } from "../../src/manifest-export.js";

test("exports the local record as plain text with an explicit demo disclaimer", () => {
  const text = formatManifest({
    ...example,
    name: "  Organização\r\nExemplo ",
    items: ["Computadores", "Mobile"],
  });
  expect(text).toContain("Manifesto de demonstração");
  expect(text).toContain("não comprova coleta, transporte ou reciclagem");
  expect(text).toContain("Referência: CT-A1B2-C3D4\nData: 01/01/2025");
  expect(text).toContain("Organização: Organização Exemplo\nCEP: 01310-100");
  expect(text).toContain("Categorias:\n- Computadores\n- Mobile\n");
});
