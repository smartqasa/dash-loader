export function setDisplayMode(mode: 'dark' | 'light'): void {
  // 1️⃣ Apply HA theme via browser_mod
  try {
    if (typeof window.browser_mod !== 'undefined') {
      window.browser_mod?.service('set_theme', { dark: mode === 'dark' });
    }
  } catch (err) {
    console.error('[setDisplayMode] Failed to set browser_mod theme:', err);
  }

  // 2️⃣ Apply dark/light mode via Fully Kiosk Browser
  try {
    if (typeof window.fully !== 'undefined') {
      const appDarkMode = mode === 'light' ? 0 : 2;
      window.fully.setStringSetting('appDarkMode', String(appDarkMode));
    }
  } catch (err) {
    console.error('[setDisplayMode] Failed to set Fully appDarkMode:', err);
  }
}
