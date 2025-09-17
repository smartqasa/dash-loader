import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardConfig, PopupDialogElement } from "./types";
import { deviceRefresh, deviceReboot } from "./device-actions";

(window as any).onFullyScreensaverStop = () => {
  document.querySelectorAll("panel-card").forEach((el: any) => {
    console.log("[Fully] Screensaver stopped → resetting + checking main-card");
    el.isMainLoaded = false;
    el.checkMainCard();
  });
};

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

  private isAdminView = false;
  private rebootTime: string | null = null;
  private refreshTime: string | null = null;

  private handleVisibility = (): void => {
    this.requestUpdate();
  };

  public getCardSize(): number | Promise<number> {
    return 20;
  }

  public connectedCallback(): void {
    super.connectedCallback();

    document.addEventListener("visibilitychange", this.handleVisibility);
    if (window.fully?.bind)
      window.fully.bind("onScreensaverStop", "onFullyScreensaverStop()");

    this.checkMainCard();
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

    if (!this.isMainLoaded || !this.config || !this.hass) {
      return html`
        <div class="loader-container">
          <div class="loading-text">SmartQasa is loading</div>
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
      `;
    }

    return html`
      <main-card .config=${this.config} .hass=${this.hass}></main-card>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
      this.checkDeviceTriggers();
      this.syncPopups();
    }
  }

  disconnectedCallback(): void {
    document.removeEventListener("visibilitychange", this.handleVisibility);

    super.disconnectedCallback();
  }

  private async checkMainCard(): Promise<void> {
    try {
      await customElements.whenDefined("main-card");
      this.isMainLoaded = true;
      this.requestUpdate();
      console.log("[PanelCard] main-card defined, isMainLoaded set true");
    } catch (err) {
      console.error("[PanelCard] Error waiting for main-card:", err);
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

  private syncPopups(): void {
    if (!this.hass) return;

    document.querySelectorAll("popup-dialog").forEach((popup) => {
      if ((popup as PopupDialogElement).hass !== undefined) {
        (popup as PopupDialogElement).hass = this.hass;
      }
    });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        background-color: var(--panel-color);
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
