import { css, CSSResult, html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard } from 'custom-card-helpers';
import { getDeviceType } from '../utilities/get-device-info';
import {
  SettingsStorage,
  SettingsData,
  BrightnessMap,
} from '../utilities/settings-storage';
import clickSound from '../assets/click.mp3';

window.customCards.push({
  type: 'settings-card',
  name: 'Settings Card',
  preview: false,
  description: 'A SmartQasa card for tablet audio and brightness per phase.',
});

@customElement('settings-card')
export class SettingsCard extends LitElement implements LovelaceCard {
  public getCardSize(): number {
    return 10;
  }

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Boolean, reflect: true }) mobile: boolean =
    getDeviceType() === 'mobile';

  @state() displayMode: 'auto' | 'light' | 'dark' = 'auto';
  @state() volumeLevel: number = window.fully?.getAudioVolume(3) || 0;
  @state() brightnessMap: BrightnessMap = {};
  @state() channel: 'main' | 'beta' = 'main';
  @state() autoUpdate: boolean = true;

  private prevBrightness: number = window.fully?.getScreenBrightness() || 255;

  private boundHandleDeviceChanges = () => this.handleDeviceChanges();

  public connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener('resize', this.boundHandleDeviceChanges);
    this.handleDeviceChanges();
    this.initSettingsFile();
    this.loadSqConfig();
  }

  public disconnectedCallback(): void {
    window.removeEventListener('resize', this.boundHandleDeviceChanges);
    super.disconnectedCallback();
  }

  public setConfig(): void {}

  protected render(): TemplateResult | typeof nothing {
    const deviceModel = window.fully?.getDeviceModel() || 'Unknown';

    const androidVer = window.fully?.getAndroidVersion() || 'Unknown';
    const fullyVer = window.fully?.getFullyVersion() || 'Unknown';

    const isConnected = window.fully?.isNetworkConnected() ?? false;
    const ipAddress = window.fully?.getIp4Address() || 'Unknown';
    const isWifiConnect = window.fully?.isWifiConnected() ?? false;
    const wifiSsid = window.fully?.getWifiSsid() || 'Unknown';

    const batteryLevel = window.fully?.getBatteryLevel() || 0;
    const isCharging = window.fully?.isPlugged() || false;

    const phaseEntity = this.hass?.states['input_select.location_phase'];
    const phases: string[] = phaseEntity?.attributes?.options ?? [];
    const currentPhase = phaseEntity?.state ?? 'Unknown';
    for (const phase of phases) {
      if (!(phase in this.brightnessMap)) {
        this.brightnessMap = { ...this.brightnessMap, [phase]: 255 };
      }
    }

    return html`
      <div class="section">
        <div class="title">Model: ${deviceModel}</div>
        <div class="title">
          Software: Android ${androidVer} / Fully ${fullyVer}
        </div>
        <div class="title">
          ${isConnected
            ? `Connected: ${
                isWifiConnect ? `${wifiSsid}` : 'Ethernet'
              } (${ipAddress})`
            : 'Disconnected'}
        </div>
        <div class="title">
          Batttery ${isCharging ? 'Charging' : 'Discharging'}: ${batteryLevel}%
        </div>
      </div>
      <div class="section">
        <div class="radio-group">
          <div class="title">Mode:</div>
          ${(['auto', 'light', 'dark'] as const).map(
            (mode) => html`
              <label class="radio-option">
                <ha-radio
                  .checked=${this.displayMode === mode}
                  name="displayMode"
                  value=${mode}
                  @change=${(e: Event) =>
                    this.handleModeChange(
                      (e.currentTarget as HTMLInputElement).value as
                        | 'auto'
                        | 'light'
                        | 'dark'
                    )}
                ></ha-radio>
                <span class="label">
                  ${mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
              </label>
            `
          )}
        </div>
      </div>
      <div class="section">
        <div class="row">
          <div class="info">
            <span class="label">Volume</span>
            <span class="value">${this.volumeLevel}</span>
          </div>
          <sq-slider
            .value=${this.volumeLevel}
            .min=${0}
            .max=${100}
            .step=${5}
            @sq-slider-render=${(e: CustomEvent) =>
              this.handleVolumeRender(e.detail.value)}
            @sq-slider-change=${(e: CustomEvent) =>
              this.handleVolumeChange(e.detail.value)}
          ></sq-slider>
        </div>
      </div>
      <div class="section">
        <div class="title">Brightness</div>
        ${phases.length === 0
          ? html`<div class="info">
              <em>No phases defined in input_select.location_phase</em>
            </div>`
          : phases.map(
              (phase) => html`
                <div class="row">
                  <div class="info">
                    <span
                      class="label ${phase === currentPhase
                        ? 'active-phase'
                        : ''}"
                    >
                      ${phase}
                    </span>
                    <span class="value">
                      ${Math.round((this.brightnessMap[phase] / 255) * 100)}%
                    </span>
                  </div>
                  <sq-slider
                    .value=${this.brightnessMap[phase]}
                    .min=${0}
                    .max=${255}
                    .step=${1}
                    @sq-slider-render=${(e: CustomEvent) =>
                      this.handleBrightnessRender(phase, e.detail.value)}
                    @sq-slider-change=${(e: CustomEvent) =>
                      this.handleBrightnessChange(phase, e.detail.value)}
                  ></sq-slider>
                </div>
              `
            )}
      </div>
      <div class="section">
        <div class="radio-group">
          <div class="title">Channel:</div>
          ${(['main', 'beta'] as const).map(
            (channel) => html`
              <label class="radio-option">
                <ha-radio
                  .checked=${this.channel === channel}
                  name="displayMode"
                  value=${channel}
                  @change=${(e: Event) =>
                    this.handleChannelChange(
                      (e.currentTarget as HTMLInputElement).value as
                        | 'main'
                        | 'beta'
                    )}
                ></ha-radio>
                <span class="label">
                  ${channel.charAt(0).toUpperCase() + channel.slice(1)}
                </span>
              </label>
            `
          )}
        </div>
      </div>
      <div class="section">
        <div class="row">
          <div class="info">
            <span class="label">Automatic Updates</span>
            <span class="value">${this.autoUpdate ? 'On' : 'Off'}</span>
          </div>

          <ha-switch
            .checked=${this.autoUpdate}
            @change=${(e: Event) =>
              this.handleAutoUpdateChange(
                (e.currentTarget as HTMLInputElement).checked
              )}
          ></ha-switch>
        </div>
      </div>
    `;
  }

  private handleDeviceChanges(): void {
    this.mobile = getDeviceType() === 'mobile';
  }

  private handleModeChange(mode: 'auto' | 'light' | 'dark'): void {
    try {
      if (typeof window.browser_mod !== 'undefined') {
        window.browser_mod.service('set_theme', { dark: mode });
        SettingsStorage.update({ displayMode: mode });
        this.displayMode = mode;
      }
    } catch (err) {
      console.warn('[SettingsCard] Failed to set theme mode:', err);
    }
  }

  private handleVolumeRender(value: number) {
    this.volumeLevel = value;
  }

  private handleVolumeChange(value: number) {
    if (typeof window.fully === 'undefined') return;

    try {
      window.fully.setAudioVolume(value, 3);
      this.volumeLevel = value;
    } catch (err) {
      console.warn('[SettingsCard] setAudioVolume error:', err);
    }

    try {
      const soundUrl = `${window.location.origin}${clickSound}`;
      window.fully.playSound(soundUrl, false, 3);
    } catch (err) {
      console.warn('[SettingsCard] click sound failed:', err);
    }
  }

  private handleBrightnessRender(phase: string, value: number) {
    this.brightnessMap = { ...this.brightnessMap, [phase]: value };

    window.fully?.setScreenBrightness(value);
  }

  private handleBrightnessChange(phase: string, value: number) {
    if (typeof window.fully === 'undefined') return;

    this.brightnessMap = { ...this.brightnessMap, [phase]: value };
    SettingsStorage.update({ brightnessMap: this.brightnessMap });

    const currentPhase =
      this.hass?.states['input_select.location_phase']?.state ?? 'Unknown';
    if (phase === currentPhase) this.prevBrightness = value;

    window.fully.setScreenBrightness(this.prevBrightness);
  }

  private handleChannelChange(channel: 'main' | 'beta'): void {
    this.channel = channel;
    this.saveSqConfig();
  }

  private handleAutoUpdateChange(enabled: boolean): void {
    this.autoUpdate = enabled;
    this.saveSqConfig();
  }

  private initSettingsFile(): void {
    const phaseEntity = this.hass?.states['input_select.location_phase'];
    const phases: string[] = phaseEntity?.attributes?.options ?? [];

    const defaultBrightness: BrightnessMap = {};
    for (const phase of phases) defaultBrightness[phase] = 255;

    const defaults: SettingsData = {
      displayMode: 'auto',
      brightnessMap: defaultBrightness,
    };

    const settings = SettingsStorage.init(defaults);

    console.log('[SettingsCard] Loaded settings:', settings);

    this.displayMode = settings.displayMode ?? 'auto';

    const merged: BrightnessMap = {
      ...defaultBrightness,
      ...settings.brightnessMap,
    };
    this.brightnessMap = merged;
  }

  private async loadSqConfig(): Promise<void> {
    if (!this.hass) return;

    let result: any;
    try {
      result = await (this.hass as any).callService(
        'smartqasa',
        'config_read',
        undefined,
        undefined,
        undefined,
        true
      );

      if (!result || result.error) {
        console.warn('[SettingsCard] config_read returned error:', result);
        return;
      }

      this.channel = result.channel === 'beta' ? 'beta' : 'main';
      this.autoUpdate = Boolean(result.autoUpdate);

      console.log('[SettingsCard] Loaded SmartQasa config:', result);
    } catch (err) {
      console.error(
        '[SettingsCard] Failed to call smartqasa.config_read:',
        err
      );
    }
  }

  private async saveSqConfig(): Promise<void> {
    if (!this.hass) return;

    try {
      const payload = {
        channel: this.channel,
        autoUpdate: this.autoUpdate,
      };

      const result = await (this.hass as any).callService(
        'smartqasa',
        'config_write',
        undefined,
        payload,
        undefined,
        true
      );

      if (result?.error) {
        console.warn('[SettingsCard] config_write error:', result);
      } else {
        console.log('[SettingsCard] Saved SmartQasa config:', payload);
      }
    } catch (err) {
      console.error('[SettingsCard] Failed to call config_write:', err);
    }
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 525px;
        row-gap: var(--card-spacing);
        overflow-y: auto;
        scrollbar-width: none;
      }

      :host([mobile]) {
        min-width: auto;
      }

      .section {
        display: flex;
        flex-direction: column;
        row-gap: var(--card-spacing);
        padding: var(--card-padding);
        background-color: var(--card-background-color);
        box-shadow: var(--card-box-shadow);
        border: var(--card-border);
        border-radius: var(--card-border-radius);
        box-sizing: border-box;
      }

      .title {
        font-size: var(--primary-font-size);
        font-weight: var(--primary-font-weight);
        color: var(--primary-text-color);
      }

      .radio-group {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
      }

      .radio-option {
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .row {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .label {
        font-size: var(--primary-font-size);
        font-weight: var(--primary-font-weight);
        color: var(--primary-text-color);
      }

      .label.active-phase {
        color: var(--accent-color);
        font-weight: bold;
      }

      .value {
        font-size: var(--secondary-font-size);
        color: var(--secondary-text-color);
      }

      sq-slider {
        flex: 1;
      }
    `;
  }
}
