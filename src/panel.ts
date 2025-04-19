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
import { deviceRefresh, deviceReboot } from "./device-actions";

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
  @state() private rebootDevicesState: string = "off";
  @state() private refreshDevicesState: string = "off";
  @state() private initialized = false;
  @state() private isElementLoaded = false;
  @state() private mainCard: LovelaceCard | undefined;

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

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
      const reboot = this.hass.states["input_button.reboot_devices"]?.state;
      if (reboot !== undefined && this.rebootDevicesState !== reboot) {
        this.rebootDevicesState = reboot;
      }

      const refresh = this.hass.states["input_button.refresh_devices"]?.state;
      if (refresh !== undefined && this.refreshDevicesState !== refresh) {
        this.refreshDevicesState = refresh;
      }
    }
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

      if (this.initialized) {
        if (
          changedProps.get("rebootDevicesState") !== this.rebootDevicesState
        ) {
          deviceReboot();
        }

        if (
          changedProps.get("refreshDevicesState") !== this.refreshDevicesState
        ) {
          deviceRefresh();
        }
      } else {
        this.initialized = true;
      }
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
