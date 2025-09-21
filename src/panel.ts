import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createThing } from "custom-card-helpers";
import {
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceCard,
  PopupDialogElement,
} from "./types";
import { deviceRefresh, deviceReboot } from "./device-actions";

const SCREENSAVER_TIMEOUT = 5 * 60 * 1000;

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

  @state() mainCard?: LovelaceCard;
  @state() isScreensaverActive = false;

  private isAdminView = false;
  private rebootTime: string | null = null;
  private refreshTime: string | null = null;
  private boundTouchHandler = () => this.exitScreensaver();
  private boundMouseHandler = () => this.exitScreensaver();
  private boundKeyHandler = () => this.exitScreensaver();
  private screensaverTimer: ReturnType<typeof setTimeout> | null = null;

  private handleVisibility = (): void => {
    this.requestUpdate();
  };

  public getCardSize(): number | Promise<number> {
    return 20;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.handleVisibility);

    if (window.fully) {
      window.addEventListener("touchstart", this.boundTouchHandler, {
        passive: true,
      });
      window.addEventListener("mousemove", this.boundMouseHandler);
      window.addEventListener("keydown", this.boundKeyHandler);

      if (window.fully.bind) {
        window.fully.bind("onMotion", "onFullyMotion()");
      }
      (window as any).onFullyMotion = () => this.exitScreensaver();

      this.resetScreensaverTimer();
    }
  }

  public disconnectedCallback(): void {
    document.removeEventListener("visibilitychange", this.handleVisibility);

    if (window.fully) {
      window.removeEventListener("touchstart", this.boundTouchHandler);
      window.removeEventListener("mousemove", this.boundMouseHandler);
      window.removeEventListener("keydown", this.boundKeyHandler);
    }

    if (this.screensaverTimer) {
      clearTimeout(this.screensaverTimer);
      this.screensaverTimer = null;
    }

    super.disconnectedCallback();
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

    if (!this.mainCard || !this.config || !this.hass) {
      return html`
        <div class="loader-container">
          <div class="loading-text">SmartQasa is loading</div>
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
      `;
    }

    if (this.isScreensaverActive && window.fully) {
      return html`
        <screensaver-card
          .config=${this.config}
          .hass=${this.hass}
        ></screensaver-card>
      `;
    }

    return html` ${this.mainCard} `;
  }

  protected firstUpdated(): void {
    this.createMainCard();
  }

  protected updated(changedProps: PropertyValues): void {
    if (!this.mainCard) return;

    if (changedProps.has("config") && this.config) {
      this.mainCard.setConfig(this.config);
    }
    if (changedProps.has("hass") && this.hass) {
      this.mainCard.hass = this.hass;
      this.syncHass();
      this.checkDeviceTriggers();
    }
  }

  private async createMainCard(retries = 5): Promise<void> {
    try {
      await customElements.whenDefined("main-card");

      if (!this.mainCard) {
        const element = document.createElement("main-card") as LovelaceCard;
        this.mainCard = element;
      }
    } catch (err) {
      console.error("[PanelCard] Error waiting for main-card:", err);
      if (retries > 0) {
        this.mainCard = undefined;
        setTimeout(() => this.createMainCard(retries - 1), 1000);
      }
    }
  }

  private syncHass(): void {
    if (!this.hass) return;

    if (this.mainCard) this.mainCard.hass = this.hass;

    document.querySelectorAll("popup-dialog").forEach((popup) => {
      if ((popup as PopupDialogElement).hass !== undefined) {
        (popup as PopupDialogElement).hass = this.hass;
      }
    });
  }

  private resetScreensaverTimer(): void {
    if (this.screensaverTimer) {
      clearTimeout(this.screensaverTimer);
    }
    if (window.fully) {
      this.screensaverTimer = setTimeout(() => {
        this.isScreensaverActive = true;
      }, SCREENSAVER_TIMEOUT);
    }
  }

  private exitScreensaver(): void {
    this.resetScreensaverTimer();
    if (this.isScreensaverActive) {
      window.dispatchEvent(new Event("smartqasa-fade-request"));
      this.isScreensaverActive = false;
    }
  }

  private checkDeviceTriggers(): void {
    if (!this.hass) return;

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
        background-color: var(--panel-color, #000);
      }

      :host(.admin-view) {
        height: calc(100vh - 56px);
      }

      .loader-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .loading-text {
        font-size: 1.5rem;
        font-weight: 300;
        margin-bottom: 1rem;
        color: var(--primary-text-color);
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
        background: var(--primary-text-color);
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
