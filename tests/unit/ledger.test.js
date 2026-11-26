import { describe, expect, it } from "vitest";
import {
  categories,
  example,
  findManifest,
  normalizeReference,
  saveManifest,
  validateDraft,
} from "../../src/ledger.js";

const reference = "CT-1234-5678";
const draft = {
  name: "  Empresa Fictícia  ",
  cep: "01310100",
  items: ["Computadores", "Mobile"],
  consent: true,
};
const date = new Date(2025, 0, 1, 12);
const prefix = "ciclotech:manifest:";
const legacyKey = "ciclotech_os_v10";

function storage(initial = []) {
  const values = new Map(initial);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe("validação do manifesto", () => {
  it("reconhece referências com espaços externos e letras minúsculas", () => {
    expect(normalizeReference(" ct-a1b2-c3d4 ")).toBe(example.reference);
    expect(normalizeReference("CT-0000-ZZZZ")).toBeNull();
    expect(normalizeReference("")).toBeNull();
  });

  it.each([
    [{ name: "  " }, "name"],
    [{ name: "a".repeat(81) }, "name"],
    [{ cep: "123" }, "cep"],
    [{ cep: "00000 000" }, "cep"],
    [{ items: [] }, "category"],
    [{ items: ["Outros"] }, "category"],
    [{ consent: false }, "consent"],
  ])("rejeita %j", (override, issue) => {
    expect(validateDraft({ ...draft, ...override })).toBe(issue);
  });

  it("aceita as categorias oficiais e normaliza o CEP no registro", () => {
    expect(
      validateDraft({ ...draft, cep: "01310-100", items: categories }),
    ).toBeNull();
    const disk = storage();
    const manifest = saveManifest(disk, draft, () => reference, date);
    expect(manifest).toEqual({
      reference,
      name: "Empresa Fictícia",
      cep: "01310-100",
      items: ["Computadores", "Mobile"],
      date: "01/01/2025",
    });
    expect(findManifest(disk, reference)).toEqual(manifest);
    expect(disk.getItem(legacyKey)).toBeNull();
  });
});

describe("persistência local", () => {
  it("gera um código válido e não grava entradas inválidas", () => {
    const disk = storage();
    expect(() =>
      saveManifest(disk, { ...draft, consent: false }, () => reference),
    ).toThrow(TypeError);
    expect(findManifest(disk, reference)).toBeNull();
    const manifest = saveManifest(disk, {
      ...draft,
      items: ["Mobile", "Mobile"],
    });
    expect(normalizeReference(manifest.reference)).toBe(manifest.reference);
    expect(manifest.items).toEqual(["Mobile"]);
  });

  it("consulta o exemplo sem escrever no armazenamento", () => {
    const disk = storage();
    expect(findManifest(disk, "ct-a1b2-c3d4")).toBe(example);
    expect(findManifest(disk, "código inválido")).toBeNull();
    expect(disk.getItem(prefix + example.reference)).toBeNull();
  });

  it("preserva registros independentes e tenta novamente em colisões", () => {
    const disk = storage();
    const first = saveManifest(disk, draft, () => reference);
    const inputs = ["inválido", example.reference, reference, "CT-2020-2222"];
    const next = saveManifest(disk, { ...draft, name: "Outra empresa" }, () =>
      inputs.shift(),
    );
    expect(next.reference).toBe("CT-2020-2222");
    expect(findManifest(disk, first.reference)).toEqual(first);
    expect(findManifest(disk, next.reference)).toEqual(next);
    expect(() => saveManifest(disk, draft, () => reference)).toThrow(
      "código exclusivo",
    );
  });

  it("propaga bloqueio ou falha de gravação sem anunciar sucesso", () => {
    const disk = storage();
    const blocked = {
      ...disk,
      getItem: () => {
        throw new Error("bloqueado");
      },
    };
    const full = {
      ...disk,
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(() => findManifest(blocked, reference)).toThrow("bloqueado");
    expect(() => saveManifest(full, draft, () => reference)).toThrow("quota");
    expect(findManifest(disk, reference)).toBeNull();
  });

  it("lê registros legados válidos sem regravá-los", () => {
    const old = JSON.stringify([
      null,
      {
        hash: reference,
        name: "Etapa inválida",
        cep: "01310100",
        items: "Mobile",
        date: "23/01/2025",
        step: 5,
      },
      {
        hash: reference,
        name: "  Empresa legada ",
        cep: "01310100",
        items: "Mobile, Computadores",
        date: "23/01/2025",
        step: 4,
      },
    ]);
    const disk = storage([
      [legacyKey, old],
      [prefix + reference, "json inválido"],
    ]);
    expect(findManifest(disk, reference)).toEqual({
      reference,
      name: "Empresa legada",
      cep: "01310-100",
      items: ["Mobile", "Computadores"],
      date: "23/01/2025",
    });
    expect(disk.getItem(legacyKey)).toBe(old);
  });

  it.each([
    undefined,
    null,
    [],
    { reference: example.reference },
    { name: 7 },
    { cep: 12 },
    { date: false },
    { date: "inválida" },
    { items: 42 },
    { items: [1] },
    { items: ["Não permitido"] },
  ])("ignora registros danificados: %j", (invalid) => {
    const baseline = {
      reference,
      name: "Empresa fictícia",
      cep: "01310-100",
      items: ["Mobile"],
      date: "23/01/2025",
    };
    const value =
      invalid && !Array.isArray(invalid)
        ? { ...baseline, ...invalid }
        : invalid;
    expect(
      findManifest(
        storage([
          [prefix + reference, JSON.stringify(value)],
          [legacyKey, "[]"],
        ]),
        reference,
      ),
    ).toBeNull();
  });
});
