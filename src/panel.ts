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
  audioplayer?: string;
  videoplayer?: string;
  videosound?: string;
  headerchips?: LovelaceCardConfig[];
  areachips?: LovelaceCardConfig[];
  tiles?: LovelaceCardConfig[];
}

window.customCards.push({
  type: "smartqasa-panel-card",
  name: "SmartQasa panel Card",
  preview: true,
  description: "A SmartQasa card for displaying the Main panel card.",
});

@customElement("smartqasa-panel-card")
export class PanelCard extends LitElement {
  public getCardSize(): number | Promise<number> {
    return 1;
  }

  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: Config;
  @state() private mainCard?: LovelaceCard;
  @state() private isElementLoaded = false;
  private tag = "smartqasa-main-card";

  static get styles(): CSSResult {
    return css`
      :host {
        width: 100vw;
      }
    `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.testElementsLoaded();
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (!this.mainCard) {
      this.createMainCard();
      return;
    }

    if (changedProps.has("config")) this.mainCard.setConfig(this.config!);
    if (changedProps.has("hass")) this.mainCard.hass = this.hass;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.mainCard) return nothing;
    return html`${this.mainCard}`;
  }

  private testElementsLoaded(): void {
    if (!customElements.get(this.tag)) {
      setTimeout(() => this.testElementsLoaded(), 500);
      return;
    }

    this.isElementLoaded = true;
  }

  private createMainCard(): void {
    if (!this.isElementLoaded || !this.config) return;

    const element = document.createElement(this.tag) as LovelaceCard;
    element.setConfig(this.config);
    if (this.hass) element.hass = this.hass;

    this.mainCard = element;
  }
}
