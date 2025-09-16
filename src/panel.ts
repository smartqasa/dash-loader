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
  PopupDialogElement,
} from "./types";
import { deviceRefresh, deviceReboot } from "./device-actions";

window.customCards.push({
  type: "panel-card",
  name: "Panel Card",
  preview: true,
  description: "A SmartQasa card for displaying the Main panel card.",
});

@customElement("panel-card")
export class PanelCard extends LitElement {
  @property({ attribute: false }) config?: LovelaceCardConfig;
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private isMainLoaded = false;
  @state() private mainCard?: LovelaceCard;

  private isAdminView = false;
  private rebootTime: string | null = null;
  private refreshTime: string | null = null;

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      this.mainCard = undefined;
    }
  };

  public getCardSize(): number | Promise<number> {
    return 20;
  }

  public connectedCallback(): void {
    super.connectedCallback();

    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    customElements.whenDefined("main-card").then(() => {
      if (customElements.get("main-card")) {
        this.isMainLoaded = true;
      } else {
        console.error(
          "[PanelCard] whenDefined resolved, but no constructor found"
        );
      }
    });
  }

  public setConfig(config: LovelaceCardConfig): void {
    this.config = config;
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has("hass")) {
      const isAdmin = this.hass?.user?.is_admin || false;
      const isAdminMode =
        this.hass?.states["input_boolean.admin_mode"]?.state === "on" || false;
      this.isAdminView = isAdmin || isAdminMode;
    }
  }

  protected render(): TemplateResult {
    this.classList.toggle("admin-view", this.isAdminView);

    return html`
      <div class="panel-wrapper">
        ${this.mainCard ??
        html`
          <div class="loader-container">
            <div class="loading-text">SmartQasa is loading</div>
            <div class="dots"><span></span><span></span><span></span></div>
          </div>
        `}
      </div>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    this.ensureMainCard();

    if (changedProps.has("config") && this.config && this.mainCard) {
      this.mainCard.setConfig(this.config);
    }

    if (changedProps.has("hass") && this.hass) {
      if (this.mainCard) this.syncHass();
      this.checkDeviceTriggers();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }

  private ensureMainCard(): void {
    if (this.mainCard?.isConnected) return;

    this.mainCard = undefined;
    if (!this.config || !this.hass || !this.isMainLoaded) return;

    try {
      const element = document.createElement("main-card") as LovelaceCard;
      element.setConfig?.(this.config);
      element.hass = this.hass;
      this.mainCard = element;
    } catch (err) {
      console.error("[PanelCard] Failed to create main-card:", err);
      this.mainCard = undefined;
    }
  }

  private syncHass(): void {
    if (this.hass) {
      if (this.mainCard) this.mainCard.hass = this.hass;

      document.querySelectorAll("popup-dialog").forEach((popup) => {
        if ((popup as PopupDialogElement).hass !== undefined) {
          (popup as PopupDialogElement).hass = this.hass;
        }
      });
    }
  }

  private checkDeviceTriggers(): void {
    const rebootState =
      this.hass?.states?.["input_button.reboot_devices"]?.state;
    if (this.rebootTime !== null && rebootState !== this.rebootTime) {
      try {
        deviceReboot();
      } catch (err) {
        console.error("[PanelCard] Device reboot failed:", err);
      }
    }
    this.rebootTime = rebootState || null;

    const refreshState =
      this.hass?.states?.["input_button.refresh_devices"]?.state;
    if (this.refreshTime !== null && refreshState !== this.refreshTime) {
      try {
        deviceRefresh();
      } catch (err) {
        console.error("[PanelCard] Device refresh failed:", err);
      }
    }
    this.refreshTime = refreshState || null;
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
        color: white;
      }

      .dots {
        display: flex;
        gap: 0.5rem;
      }

      .dots span {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: white;
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
