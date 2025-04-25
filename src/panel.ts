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
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  PopupElement,
} from "./types";
import { deviceRefresh, deviceReboot } from "./device-actions";

interface Config extends LovelaceCardConfig {
  area: string;
  name?: string;
  picture?: string;
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

  @state() private isElementLoaded = false;
  @state() private mainCard: LovelaceCard | undefined;

  private rebootTime: string | undefined;
  private refreshTime: string | undefined;

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

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("config") && this.config) {
      if (this.mainCard) this.mainCard.setConfig(this.config);
    }

    if (changedProps.has("hass") && this.hass) {
      if (this.mainCard) {
        this.mainCard.hass = this.hass;
      } else {
        this.tryCreateMainCard();
      }

      const popups = document.querySelectorAll(
        "popup-dialog"
      ) as NodeListOf<PopupElement>;
      popups.forEach((popup) => {
        popup.hass = this.hass;
      });

      const rebootTime = this.hass.states["input_button.reboot_devices"]?.state;
      if (this.rebootTime !== undefined) {
        if (this.rebootTime !== rebootTime) deviceReboot();
      }
      this.rebootTime = rebootTime;

      const refreshTime =
        this.hass.states["input_button.refresh_devices"]?.state;
      if (this.refreshTime !== undefined) {
        if (this.refreshTime !== refreshTime) deviceRefresh();
      }
      this.refreshTime = refreshTime;
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
