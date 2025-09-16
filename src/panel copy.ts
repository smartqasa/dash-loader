import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
} from "custom-card-helpers";
import { deviceRefresh, deviceReboot } from "./device-actions";

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

  @property({ attribute: false }) config?: LovelaceCardConfig;
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private mainCard?: LovelaceCard;

  private rebootTime: string | undefined;
  private refreshTime: string | undefined;

  public connectedCallback(): void {
    super.connectedCallback();
    customElements.whenDefined("main-card").then(() => {
      this.createMainCard();
    });
  }

  public setConfig(config: LovelaceCardConfig) {
    this.config = config;
    this.createMainCard();
  }

  protected render(): TemplateResult {
    if (!this.mainCard) this.createMainCard();

    const isAdmin = this.hass?.user?.is_admin || false;
    const isAdminModeOn =
      this.hass?.states["input_boolean.admin_mode"]?.state === "on" || false;
    const isAdminView = isAdmin || isAdminModeOn;

    this.classList.toggle("admin-view", isAdminView);

    return html`
      <div class="panel-wrapper">
        ${this.mainCard
          ? this.mainCard
          : html`
              <div class="loader-container">
                <div class="loading-text">SmartQasa is loading</div>
                <div class="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            `}
      </div>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    if (customElements.get("main-card")) this.createMainCard();

    if (!this.mainCard) return;

    if (changedProps.has("config") && this.config) {
      if (!this.mainCard || !this.mainCard.isConnected) this.createMainCard();

      if (this.mainCard) this.mainCard.setConfig(this.config);
    }

    if (changedProps.has("hass") && this.hass) {
      this.mainCard.hass = this.hass;

      const popups = document.querySelectorAll("popup-dialog") ?? [];
      popups.forEach((popup: Element) => {
        if ("hass" in (popup as any)) (popup as any).hass = this.hass;
      });

      const rebootTime = this.hass.states["input_button.reboot_devices"]?.state;
      if (this.rebootTime !== undefined && this.rebootTime !== rebootTime) {
        deviceReboot();
      }
      this.rebootTime = rebootTime;

      const refreshTime =
        this.hass.states["input_button.refresh_devices"]?.state;
      if (this.refreshTime !== undefined && this.refreshTime !== refreshTime) {
        deviceRefresh();
      }
      this.refreshTime = refreshTime;
    }
  }

  private createMainCard(): void {
    if (!this.config || !this.hass) return;

    const ctor = customElements.get("main-card");
    if (!ctor) {
      console.warn("[PanelCard] main-card not defined yet");
      return;
    }

    try {
      const element = document.createElement("main-card") as LovelaceCard;
      if (typeof (element as any).setConfig === "function") {
        element.setConfig(this.config);
      } else {
        console.error("[PanelCard] main-card exists but has no setConfig()");
        return;
      }
      element.hass = this.hass;
      this.mainCard = element;
    } catch (err) {
      console.error("Failed to create main-card:", err);
      this.mainCard = undefined;
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

      .panel-wrapper {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }

      .loader-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
      }

      .loading-text {
        font-size: 1.5rem;
        font-weight: 300;
        margin-bottom: 1rem;
        color: var(--primary-text-color, #333);
      }

      .dots {
        display: flex;
        gap: 0.5rem;
      }

      .dots span {
        width: 10px;
        height: 10px;
        background: var(--primary-color, #3f51b5);
        border-radius: 50%;
        display: inline-block;
        animation: bounce 1.4s infinite ease-in-out both;
      }

      .dots span:nth-child(1) {
        animation-delay: -0.32s;
      }

      .dots span:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }
    `;
  }
}
