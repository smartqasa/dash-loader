import { css, html, LitElement } from "lit";
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
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: Config;
  @property({ type: Boolean }) private _loaded = false;

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
    this._config = config;
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
    this._loaded = true;
    this.requestUpdate();
  }

  protected render() {
    return this._loaded
      ? html`<smartqasa-main-card
          .config=${this._config}
          .hass=${this.hass}
        ></smartqasa-main-card>`
      : html`<div class="panel"></div>`;
  }
}
