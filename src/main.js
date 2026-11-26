import "@fontsource/inter/latin-300.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "@fontsource/space-grotesk/latin-700.css";
import "./site.css";

import { initEffects } from "./effects.js";
import { initMap, initMobileMenu } from "./navigation.js";
import { initTelemetry } from "./telemetry.js";
import { initTracker } from "./tracker.js";
import { initWizard } from "./wizard.js";

initWizard(initTracker());
initTelemetry();
initMobileMenu();
initMap();
initEffects();
