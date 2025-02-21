import { css, CSSResult, html, LitElement, nothing, TemplateResult } from "lit";
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
  public getCardSize(): number | Promise<number> {
    return 1;
  }

  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: Config;
  @state() private _isElementsLoaded = false;

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

  protected render(): TemplateResult | typeof nothing {
    if (!this._isElementsLoaded || !this._config || !this.hass) return nothing;

    console.log("Rendering main card", this._config);

    return html`
      <div>
        <smartqasa-main-card
          .config=${this._config}
          .hass=${this.hass}
        ></smartqasa-main-card>
      </div>
    `;
  }

  private _testElementsLoaded(): void {
    if (!customElements.get("smartqasa-main-card")) {
      setTimeout(() => this._testElementsLoaded(), 500);
      return;
    }

    this._isElementsLoaded = true;
  }
}
