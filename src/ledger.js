export const categories = ["Computadores", "Mobile", "Infraestrutura"];

const prefix = "ciclotech:manifest:";
const legacyKey = "ciclotech_os_v10";

/** @typedef {{name: string, cep: string, items: string[], consent: boolean}} Draft */
/** @typedef {{reference: string, name: string, cep: string, items: string[], date: string}} Manifest */
/** @typedef {Pick<Storage, 'getItem' | 'setItem'>} Records */

export const example = Object.freeze({
  reference: "CT-A1B2-C3D4",
  name: "Empresa Exemplo",
  cep: "01310-100",
  items: Object.freeze(["Computadores"]),
  date: "01/01/2025",
});

/** @param {string} value */
export function normalizeReference(value) {
  const reference = value.trim().toUpperCase();
  return /^CT-[0-9A-F]{4}-[0-9A-F]{4}$/.test(reference) ? reference : null;
}

/** @param {Draft} draft */
export function validateDraft(draft) {
  if (draft.name.trim().length < 2 || draft.name.trim().length > 80)
    return "name";
  if (!/^\d{5}-?\d{3}$/.test(draft.cep.trim())) return "cep";
  if (
    !draft.items.length ||
    draft.items.some((item) => !categories.includes(item))
  )
    return "category";
  if (!draft.consent) return "consent";
  return null;
}

/** @param {string | null} raw @returns {unknown} */
function parse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @param {unknown} value @param {string} reference @param {boolean} legacy @returns {Manifest | null} */
function readManifest(value, reference, legacy) {
  if (!value || typeof value !== "object") return null;
  const record = /** @type {Record<string, unknown>} */ (value);
  if (
    (legacy ? record.hash : record.reference) !== reference ||
    typeof record.name !== "string" ||
    typeof record.cep !== "string" ||
    typeof record.date !== "string" ||
    !/^\d{2}\/\d{2}\/\d{4}$/.test(record.date)
  )
    return null;

  const items =
    legacy && typeof record.items === "string"
      ? record.items.split(", ")
      : record.items;
  if (!Array.isArray(items) || items.some((item) => typeof item !== "string"))
    return null;
  const name = record.name.trim();
  const cep = record.cep.trim().replace(/^(\d{5})(\d{3})$/, "$1-$2");
  if (validateDraft({ name, cep, items, consent: true })) return null;
  return { reference, name, cep, items, date: record.date };
}

/** @param {Records} storage @param {string} value */
export function findManifest(storage, value) {
  const reference = normalizeReference(value);
  if (!reference) return null;
  if (reference === example.reference) return example;
  const current = readManifest(
    parse(storage.getItem(prefix + reference)),
    reference,
    false,
  );
  if (current) return current;
  const prior = parse(storage.getItem(legacyKey));
  if (!Array.isArray(prior)) return null;
  for (const entry of prior) {
    const result = readManifest(entry, reference, true);
    if (result) return result;
  }
  return null;
}

function randomReference() {
  const bytes = crypto.getRandomValues(new Uint16Array(2));
  const parts = Array.from(bytes, (part) =>
    part.toString(16).toUpperCase().padStart(4, "0"),
  );
  return "CT-" + parts.join("-");
}

/** @param {Records} storage @param {Draft} draft @param {() => string} [makeReference] @param {Date} [now] */
export function saveManifest(
  storage,
  draft,
  makeReference = randomReference,
  now = new Date(),
) {
  if (validateDraft(draft)) throw new TypeError("Manifesto inválido.");
  for (let attempt = 0; attempt < 8; attempt++) {
    const reference = makeReference();
    if (
      normalizeReference(reference) !== reference ||
      findManifest(storage, reference)
    )
      continue;
    const manifest = {
      reference,
      name: draft.name.trim(),
      cep: draft.cep.trim().replace(/^(\d{5})(\d{3})$/, "$1-$2"),
      items: [...new Set(draft.items)],
      date: new Intl.DateTimeFormat("pt-BR").format(now),
    };
    storage.setItem(prefix + reference, JSON.stringify(manifest));
    return manifest;
  }
  throw new Error("Não foi possível gerar um código exclusivo.");
}
