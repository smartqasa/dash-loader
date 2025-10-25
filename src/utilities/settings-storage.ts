export interface BrightnessMap {
  Morning: number;
  Day: number;
  Evening: number;
  Night: number;
  [key: string]: number;
}

export interface SettingsData {
  brightnessMap: BrightnessMap;
  displayMode?: "light" | "dark" | "auto";
}

export class SettingsStorage {
  private static settingsFile: string | null = null;

  /** Initialize settings file and ensure it exists */
  static init(defaultSettings: SettingsData): SettingsData {
    if (typeof window.fully === "undefined") return defaultSettings;

    try {
      const basePath = window.fully.getInternalAppSpecificStoragePath();
      this.settingsFile = `${basePath}/sq-settings.json`;

      const text = window.fully.readFile(this.settingsFile);
      if (text) {
        const loaded = JSON.parse(text) as Partial<SettingsData>;
        const merged: SettingsData = {
          ...defaultSettings,
          ...loaded,
          brightnessMap: {
            ...defaultSettings.brightnessMap,
            ...(loaded.brightnessMap || {}),
          },
        };

        // Re-save merged structure to keep file consistent
        window.fully.writeFile(
          this.settingsFile,
          JSON.stringify(merged, null, 2)
        );
        return merged;
      } else {
        window.fully.writeFile(
          this.settingsFile,
          JSON.stringify(defaultSettings, null, 2)
        );
        return defaultSettings;
      }
    } catch (e) {
      console.warn("[SettingsStorage] init error:", e);
      return defaultSettings;
    }
  }

  /** Update a property and save back to file */
  static update(partial: Partial<SettingsData>): void {
    if (typeof window.fully === "undefined" || !this.settingsFile) return;

    try {
      const text = window.fully.readFile(this.settingsFile);
      const data: SettingsData = text ? JSON.parse(text) : ({} as SettingsData);
      const merged: SettingsData = {
        ...data,
        ...partial,
        brightnessMap: {
          ...(data.brightnessMap || {}),
          ...(partial.brightnessMap || {}),
        },
      };
      window.fully.writeFile(
        this.settingsFile,
        JSON.stringify(merged, null, 2)
      );
    } catch (e) {
      console.warn("[SettingsStorage] update error:", e);
    }
  }

  /** Read the current settings file */
  static read(): SettingsData | null {
    if (typeof window.fully === "undefined") return null;

    try {
      if (!this.settingsFile) {
        const basePath = window.fully.getInternalAppSpecificStoragePath();
        this.settingsFile = `${basePath}/sq-settings.json`;
      }

      const text = window.fully.readFile(this.settingsFile);
      if (!text) return null;

      return JSON.parse(text) as SettingsData;
    } catch (e) {
      console.warn("[SettingsStorage] read error:", e);
      return null;
    }
  }
}
