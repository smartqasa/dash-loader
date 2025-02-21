import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardConfig } from "./types";

interface Config extends LovelaceCardConfig {
  area: string;
  name?: string;
  picture?: string;
  audio_player?: string;
  video_player?: string;
  video_sound?: string;
  header_chips?: LovelaceCardConfig[];
  area_chips?: LovelaceCardConfig[];
  tiles?: LovelaceCardConfig[];
}

@customElement("smartqasa-panel-card")
export class PanelCard extends LitElement {
  @property({ attribute: false }) public hass: HomeAssistant | undefined;
  @state() private config: Config | undefined;
  @state() private _loaded = false;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: var(--primary-background-color, white);
    }
    .panel {
      border: 6px solid #ccc;
      border-top: 6px solid #000;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  public setConfig(config: Config) {
    this.config = config;
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this._waitForMainCard();
  }

  private async _waitForMainCard(): Promise<void> {
    while (!customElements.get("smartqasa-main-card")) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log("Main card loaded");
    this._loaded = true;
    this.requestUpdate();
  }

  protected render(): TemplateResult {
    if (!this.hass) return html`<p>HA not available.</p>`;
    if (!this.config) return html`<p>No config found.</p>`;

    if (!this._loaded) {
      return html`<div class="panel"></div>`;
    }

    console.log("Rendering main card");
    return html` <smartqasa-main-card
      .config=${this.config}
      .hass=${this.hass}
    ></smartqasa-main-card>`;
  }
}
