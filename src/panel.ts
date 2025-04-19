import { css, CSSResult, html, LitElement, nothing, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "./types";

interface Config extends LovelaceCardConfig {
  area: string;
  name?: string;
  picture?: string;
  audioplayer?: string;
  videoplayer?: string;
  videosound?: string;
  headerchips?: LovelaceCardConfig[];
  areachips?: LovelaceCardConfig[];
  tiles?: LovelaceCardConfig[];
}

window.customCards.push({
  type: "panel-card",
  name: "Panel Card",
  preview: true,
  description: "A SmartQasa card for displaying the Main panel card.",
});

@customElement("panel-card")
export class PanelCard extends LitElement {
  public getCardSize(): number | Promise<number> {
    return 1;
  }

  @property({ attribute: false }) public hass: HomeAssistant | undefined;
  @property({ attribute: false }) private config: Config | undefined;
  @state() private mainCard: LovelaceCard | undefined;
  @state() private isElementLoaded = false;

  static get styles(): CSSResult {
    return css`
      :host {
        width: 100vw;
      }
    `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    customElements.whenDefined("main-card").then(() => {
      this.isElementLoaded = true;
      this.tryCreateMainCard();
    });
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.mainCard) return nothing;
    return html`${this.mainCard}`;
  }

  protected updated(): void {
    this.tryCreateMainCard();

    if (this.mainCard) {
      if (this.config) this.mainCard.setConfig(this.config);
      if (this.hass) this.mainCard.hass = this.hass;
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mainCard = undefined;
  }

  private tryCreateMainCard(): void {
    if (!this.config || !this.hass || this.mainCard || !this.isElementLoaded)
      return;

    const element = document.createElement("main-card") as LovelaceCard;
    element.setConfig(this.config);
    element.hass = this.hass;
    this.mainCard = element;
  }
}
