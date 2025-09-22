window.smartqasa = window.smartqasa || {};

import "./panel";
import "./screensaver";

// index.ts or main.ts
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

console.info(
  `%c SmartQasa Loader ⏏ ${__BUILD_VERSION__} (Built: ${__BUILD_TIMESTAMP__}) `,
  "background-color: #0000ff; color: #ffffff; font-weight: 700;"
);
