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

declare const fully: {
  disableWifi: () => void;
  enableWifi: () => void;
};

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

  private offlineDetected = false;
  private wifiOfflineTimer?: number;

  public connectedCallback(): void {
    super.connectedCallback();
    customElements.whenDefined("main-card").then(() => {
      this.isElementLoaded = true;
      this.tryCreateMainCard();

      window.addEventListener("offline", this.handleOffline);
      window.addEventListener("online", this.handleOnline);
    });
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.mainCard) return nothing;

    const isAdmin = this.hass?.user?.is_admin || false;
    const isAdminModeOn =
      this.hass?.states["input_boolean.admin_mode"]?.state === "on" || false;
    const isAdminView = isAdmin || isAdminModeOn;

    this.classList.toggle("admin-view", isAdminView);

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

    window.removeEventListener("offline", this.handleOffline);
    window.removeEventListener("online", this.handleOnline);
  }

  private tryCreateMainCard(): void {
    if (!this.config || !this.hass || this.mainCard || !this.isElementLoaded)
      return;

    const element = document.createElement("main-card") as LovelaceCard;
    element.setConfig(this.config);
    element.hass = this.hass;
    this.mainCard = element;
  }

  private handleOffline = (): void => {
    if (typeof fully === "undefined" || !fully.disableWifi || !fully.enableWifi)
      return;

    if (!this.mainCard) return;

    if (!this.offlineDetected) {
      this.offlineDetected = true;
      this.wifiOfflineTimer = window.setTimeout(
        (): void => {
          fully.disableWifi();
          window.setTimeout((): void => {
            fully.enableWifi();
          }, 2000);
        },
        5 * 60 * 1000
      );
    }
  };

  private handleOnline = () => {
    if (typeof fully === "undefined" || !fully.disableWifi || !fully.enableWifi)
      return;

    if (this.offlineDetected) {
      this.clearWifiTimer();
      this.offlineDetected = false;
    }
  };

  private clearWifiTimer() {
    if (this.wifiOfflineTimer) {
      clearTimeout(this.wifiOfflineTimer);
      this.wifiOfflineTimer = undefined;
    }
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }
      :host(.admin-view) {
        height: calc(100vh - 56px);
      }
    `;
  }
}
