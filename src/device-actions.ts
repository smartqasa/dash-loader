import { HomeAssistant } from "./types";

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

type DeviceAction = "refresh" | "reboot";

const handleDeviceAction = (
  hass: HomeAssistant,
  entityId: string,
  currentState: string | undefined,
  action: DeviceAction
): string => {
  const state = hass.states[entityId]?.state;
  if (currentState === undefined || currentState === state) {
    return state;
  }

  if (action === "refresh") {
    if (typeof window.fully !== "undefined") {
      void executeFullyAction("restartApp");
    } else if (typeof window.browser_mod !== "undefined") {
      window.browser_mod.service("refresh");
    }
  } else if (action === "reboot") {
    void executeFullyAction("reboot");
  }

  return state;
};

export const deviceRefresh = (
  hass: HomeAssistant,
  deviceRefreshState: string | undefined
): string =>
  handleDeviceAction(
    hass,
    "input_button.refresh_devices",
    deviceRefreshState,
    "refresh"
  );

export const deviceReboot = (
  hass: HomeAssistant,
  deviceRebootState: string | undefined
): string =>
  handleDeviceAction(
    hass,
    "input_button.reboot_devices",
    deviceRebootState,
    "reboot"
  );
