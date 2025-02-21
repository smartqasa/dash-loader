import { css, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "./types";

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
  public getCardSize(): number | Promise<number> {
    return 1;
  }

  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: Config;
  @state() private _mainCard?: LovelaceCard;
  @state() private _isLoaded = false;

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
    this._loadMainCard();
  }

  private _loadMainCard(): void {
    if (!this._config || !this.hass) return;

    const tag = "smartqasa-main-card";

    if (!customElements.get(tag)) {
      console.warn(`Waiting for ${tag} to load...`);
      setTimeout(() => this._loadMainCard(), 500);
      return;
    }

    const element = document.createElement(tag) as LovelaceCard;
    element.setConfig(this._config);
    element.hass = this.hass;

    this._isLoaded = true;
  }

  protected render(): TemplateResult {
    if (!this.hass) return html`<p>HA not available.</p>`;
    if (!this._config) return html`<p>No config found.</p>`;

    return this._isLoaded
      ? html`${this._mainCard}`
      : html`<div class="panel"></div>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this._loadMainCard();
  }
}
