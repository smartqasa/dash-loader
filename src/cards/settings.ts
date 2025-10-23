import { css, CSSResult, html, LitElement, nothing, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard } from "custom-card-helpers";
import { getDeviceType } from "../utilities/get-device-info";
import {
  SettingsStorage,
  SettingsData,
  BrightnessMap,
} from "../utilities/settings-storage";

window.customCards.push({
  type: "settings-card",
  name: "Settings Card",
  preview: false,
  description: "A SmartQasa card for tablet audio and brightness per phase.",
});

@customElement("settings-card")
export class SettingsCard extends LitElement implements LovelaceCard {
  public getCardSize(): number {
    return 10;
  }

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Boolean, reflect: true }) mobile: boolean =
    getDeviceType() === "mobile";

  @state() volumeLevel: number = window.fully?.getAudioVolume(3) || 0;
  @state() brightnessMap: BrightnessMap = {
    Morning: 128,
    Day: 255,
    Evening: 100,
    Night: 30,
  };

  private prevBrightness: number = window.fully?.getScreenBrightness() || 255;
  private boundHandleDeviceChanges = () => this.handleDeviceChanges();

  public connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener("resize", this.boundHandleDeviceChanges);
    this.handleDeviceChanges();
    this.initSettingsFile();
  }

  public disconnectedCallback(): void {
    window.removeEventListener("resize", this.boundHandleDeviceChanges);
    super.disconnectedCallback();
  }

  public setConfig(): void {}

  protected render(): TemplateResult | typeof nothing {
    const phases = ["Morning", "Day", "Evening", "Night"];
    const currentPhase =
      this.hass?.states["input_select.phase_of_day"]?.state ?? "Unknown";

    return html`
      <div class="section">
        <div class="title">Tablet Info</div>
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
            .step=${1}
            @sq-slider-render=${(e: CustomEvent) =>
              this.handleVolumeRender(e.detail.value)}
            @sq-slider-change=${(e: CustomEvent) =>
              this.handleVolumeChange(e.detail.value)}
          ></sq-slider>
        </div>
      </div>
      <div class="section">
        <div class="title">Brightness</div>
        ${phases.map(
          (phase) => html`
            <div class="row">
              <div class="info">
                <span
                  class="label ${phase === currentPhase ? "active-phase" : ""}"
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
    `;
  }

  private handleDeviceChanges(): void {
    this.mobile = getDeviceType() === "mobile";
  }

  private handleVolumeRender(value: number) {
    this.volumeLevel = value;
  }

  private handleVolumeChange(value: number) {
    if (typeof window.fully === "undefined") return;

    try {
      window.fully.setAudioVolume(value, 3);
      this.volumeLevel = value;
    } catch (err) {
      console.warn("[SettingsCard] setAudioVolume error:", err);
    }

    try {
      window.fully.playSound(
        "https://www.soundjay.com/buttons/beep-07a.mp3",
        false,
        3
      );
    } catch (err) {
      console.warn("[SettingsCard] click sound failed:", err);
    }
  }

  private handleBrightnessRender(phase: string, value: number) {
    this.brightnessMap = { ...this.brightnessMap, [phase]: value };

    window.fully?.setScreenBrightness(value);
  }

  private handleBrightnessChange(phase: string, value: number) {
    if (typeof window.fully === "undefined") return;

    this.brightnessMap = { ...this.brightnessMap, [phase]: value };
    SettingsStorage.update({ brightnessMap: this.brightnessMap });

    const currentPhase =
      this.hass?.states["input_select.location_phase"]?.state ?? "Unknown";
    if (phase === currentPhase) this.prevBrightness = value;

    window.fully.setScreenBrightness(this.prevBrightness);
  }

  private initSettingsFile(): void {
    const defaults: SettingsData = {
      brightnessMap: this.brightnessMap,
    };

    const settings = SettingsStorage.init(defaults);
    this.brightnessMap = settings.brightnessMap;
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
