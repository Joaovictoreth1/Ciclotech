import "@fontsource/inter/latin-300.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "@fortawesome/fontawesome-free/css/regular.css";
import "@fortawesome/fontawesome-free/css/brands.css";
import "./site.css";

import { initEffects } from "./effects.js";
import { initTelemetry } from "./telemetry.js";
import { initTracker } from "./tracker.js";
import { initWizard } from "./wizard.js";

/** @type {Map<string, string>} */
const temporary = new Map();
/** @type {import("./ledger.js").Records} */
const temporaryRecords = {
  getItem: (key) => temporary.get(key) ?? null,
  setItem: (key, value) => {
    temporary.set(key, value);
  },
};

initWizard(initTracker(temporaryRecords), temporaryRecords);
initTelemetry();
initEffects();
