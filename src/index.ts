window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  console.error(
    "%c[LOADER] Unhandled Promise Rejection",
    "color: red; font-weight: bold;",
    {
      message: reason?.message ?? reason,
      stack: reason?.stack ?? "(no stack trace)",
      type: reason?.name ?? typeof reason,
      time: new Date().toISOString(),
    }
  );
});

window.addEventListener("error", (event) => {
  console.error("%c[LOADER] Uncaught Error", "color: red; font-weight: bold;", {
    message: event.message,
    file: `${event.filename}:${event.lineno}:${event.colno}`,
    stack: event.error?.stack ?? "(no stack trace)",
    time: new Date().toISOString(),
  });
});

window.smartqasa = window.smartqasa || {};

import "./panel";
import "./screensaver";

console.info(
  `%c SmartQasa Loader ⏏ ${__BUILD_VERSION__} (Built: ${__BUILD_TIMESTAMP__}) `,
  "background-color: #0000ff; color: #ffffff; font-weight: 700;"
);
