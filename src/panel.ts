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
  @state() private _isElementLoaded = false;

  static styles = css`
    :host {
      width: 100vw;
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

  public connectedCallback(): void {
    super.connectedCallback();
    this._testElementsLoaded();
  }

  public setConfig(config: Config) {
    this._config = config;
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (!this._mainCard) {
      this._createMainCard();
      return;
    }

    if (changedProps.has("hass")) {
      this._mainCard.hass = this.hass;
    }
    if (changedProps.has("_config")) {
      this._mainCard.setConfig(this._config!);
    }
  }

  protected render(): TemplateResult {
    return this._mainCard
      ? html`${this._mainCard}`
      : html`<div class="panel"></div>`;
  }

  private _testElementsLoaded(): void {
    const tag = "smartqasa-main-card";
    if (!customElements.get(tag)) {
      console.warn(`Waiting for ${tag} to load...`);
      setTimeout(() => this._testElementsLoaded(), 500);
      return;
    }

    this._isElementLoaded = true;
  }

  private _createMainCard(): void {
    if (!this._isElementLoaded || !this._config) return;

    const element = document.createElement(
      "smartqasa-main-card"
    ) as LovelaceCard;
    element.setConfig(this._config);
    if (this.hass) element.hass = this.hass;

    this._mainCard = element;
  }
}
