import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceCard,
  PopupDialogElement,
} from "./types";
import { deviceRefresh, deviceReboot } from "./device-actions";

const SCREENSAVER_TIMEOUT = 1 * 60 * 1000;

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
  @state() isSaverActive = false;
  @state() fadeRequested = false;

  private isAdminView = false;
  private rebootTime: string | null = null;
  private refreshTime: string | null = null;

  private handleVisibility = (): void => {
    this.requestUpdate();
  };

  private boundHandleFade = () => this.handleFade();
  private boundTouchHandler = () => this.resetSaver();
  private boundMouseHandler = () => this.resetSaver();
  private boundKeyHandler = () => this.resetSaver();

  private saverTimer: ReturnType<typeof setTimeout> | null = null;

  public getCardSize(): number | Promise<number> {
    return 20;
  }

  public connectedCallback(): void {
    super.connectedCallback();

    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("sq-fade-request", this.boundHandleFade);

    if (window.fully) {
      window.addEventListener("touchstart", this.boundTouchHandler, {
        passive: true,
      });
      window.addEventListener("mousemove", this.boundMouseHandler);
      window.addEventListener("keydown", this.boundKeyHandler);

      (window as any).onFullyMotion = () => this.resetSaver();
      if (window.fully.bind) {
        window.fully.bind("onMotion", "onFullyMotion()");
      }

      this.resetSaver();
    }
  }

  public disconnectedCallback(): void {
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("sq-fade-request", this.boundHandleFade);

    if (window.fully) {
      window.removeEventListener("touchstart", this.boundTouchHandler);
      window.removeEventListener("mousemove", this.boundMouseHandler);
      window.removeEventListener("keydown", this.boundKeyHandler);
    }

    if (this.saverTimer) {
      clearTimeout(this.saverTimer);
      this.saverTimer = null;
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

    if (changedProps.has("fadeRequested")) {
      const container =
        this.shadowRoot?.querySelector<HTMLElement>(".container");
      if (container) {
        if (this.fadeRequested) {
          container.classList.remove("visible");
        } else {
          container.classList.add("visible");
        }
      }
    }
  }

  protected render(): TemplateResult {
    this.classList.toggle("admin-view", this.isAdminView);

    const containerClass = {
      container: true,
      visible: !this.fadeRequested,
      loader: !this.mainCard || !this.config || !this.hass,
    };

    if (!this.mainCard || !this.config || !this.hass) {
      return html`
        <div class=${classMap(containerClass)}>
          <div class="loading-text">SmartQasa is loading</div>
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
      `;
    }

    if (this.isSaverActive) {
      return html`
        <div class=${classMap(containerClass)}>
          <screensaver-card
            .config=${this.config}
            .hass=${this.hass}
          ></screensaver-card>
        </div>
      `;
    }

    return html`
      <div class=${classMap(containerClass)}>${this.mainCard}</div>
    `;
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
      this.syncHass();
      this.checkDeviceTriggers();
    }

    if (changedProps.has("fadeRequested") && this.fadeRequested) {
      this.fadeRequested = false;
    }
  }

  private async createMainCard(retries = 5): Promise<void> {
    try {
      await customElements.whenDefined("main-card");

      if (!this.mainCard) {
        const element: LovelaceCard = document.createElement(
          "main-card"
        ) as LovelaceCard;
        if (this.config) element.setConfig(this.config);
        if (this.hass) element.hass = this.hass;
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

  private resetSaver(): void {
    if (!window.fully) return;

    if (this.isSaverActive) this.exitSaver();
    if (this.saverTimer) clearTimeout(this.saverTimer);

    this.saverTimer = setTimeout(() => {
      this.showSaver();
    }, SCREENSAVER_TIMEOUT);
  }

  private async showSaver(): Promise<void> {
    this.isSaverActive = true;
  }

  private exitSaver(): void {
    this.isSaverActive = false;
    this.handleFade();
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

  private handleFade(): void {
    this.fadeRequested = true;
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

      .container {
        width: 100%;
        height: 100%;
        opacity: 0;
        will-change: opacity;
        transition: opacity 200ms ease-in-out;
      }

      .container.visible {
        opacity: 1;
      }

      .container.loader {
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
