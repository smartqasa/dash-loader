const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function executeFullyAction(
  action: "restartApp" | "reboot"
): Promise<void> {
  if (typeof window.fully === "undefined") return;

  const timings = {
    bringToFore: 1000,
    regainFocus: 500,
    clearCache: 1000,
  };

  if (!window.fully.isInForeground()) {
    window.fully.bringToForeground();
    await delay(timings.bringToFore);
  }

  window.fully.setStringSetting("timeToRegainFocus", "0");
  await delay(timings.regainFocus);

  window.fully.clearCache();
  await delay(timings.clearCache);

  window.fully[action]();
}

function bustCacheAndReload(): void {
  const url = new URL(window.location.href);
  url.searchParams.set("nocache", Date.now().toString());

  window.history.replaceState(null, "", url.toString());

  window.location.reload();
}

export function deviceRefresh(): void {
  if (typeof window.fully === "undefined") {
    bustCacheAndReload();
  } else {
    void executeFullyAction("restartApp");
  }
}

export function deviceReboot(): void {
  if (typeof window.fully === "undefined") {
    bustCacheAndReload();
  } else {
    void executeFullyAction("reboot");
  }
}
