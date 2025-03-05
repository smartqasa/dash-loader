const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type FullyAction = "restartApp" | "reboot";

const executeFullyAction = async (action: FullyAction): Promise<void> => {
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
};

export function deviceRefresh(): void {
  if (typeof window.fully !== "undefined") {
    void executeFullyAction("restartApp");
  } else if (typeof window.browser_mod !== "undefined") {
    window.browser_mod.service("refresh");
  }
}

export function deviceReboot(): void {
  if (typeof window.fully !== "undefined") {
    void executeFullyAction("reboot");
  }
}
