import {
  css,
  CSSResult,
  html,
  LitElement,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
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

  //@property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: Config;
  @state() private _mainCard?: LovelaceCard;
  @state() private _isElementLoaded = false;
  private _tag = "smartqasa-main-card";

  static get styles(): CSSResult {
    return css`
      :host {
        width: 100vw;
      }
    `;
  }

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

    if (changedProps.has("_config")) this._mainCard.setConfig(this._config!);
    //if (changedProps.has("hass")) this._mainCard.hass = this.hass;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._mainCard) return nothing;
    return html`${this._mainCard}`;
  }

  private _testElementsLoaded(): void {
    if (!customElements.get(this._tag)) {
      setTimeout(() => this._testElementsLoaded(), 500);
      return;
    }

    this._isElementLoaded = true;
  }

  private _createMainCard(): void {
    if (!this._isElementLoaded || !this._config) return;

    const element = document.createElement(this._tag) as LovelaceCard;
    element.setConfig(this._config);
    //if (this.hass) element.hass = this.hass;

    this._mainCard = element;
  }
}
