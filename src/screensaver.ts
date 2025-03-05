import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "./types";
import { formattedDate, formattedTime } from "./format-date-time";
import { deviceRefresh, deviceReboot } from "./device-actions";
import logoImage from "./logo.png";

interface Config extends LovelaceCardConfig {
  move_timer?: number;
  display: "time" | "logo";
  name?: string;
}

window.customCards.push({
  type: "smartqasa-screensaver-card",
  name: "SmartQasa Screen Saver Card",
  preview: true,
  description: "A SmartQasa card for displaying a screen saver.",
});

@customElement("smartqasa-screensaver-card")
export class ScreenSaver extends LitElement implements LovelaceCard {
  public getCardSize(): number | Promise<number> {
    return 100;
  }

  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() protected config?: Config;
  @state() private rebootDevicesState: string = "off";
  @state() private refreshDevicesState: string = "off";
  @state() private time: string = "Loading...";
  @state() private date: string = "Loading...";

  private initialized = false;
  private moveTimerId: number | undefined;
  private timeIntervalId: number | undefined;

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
        background-color: black;
        box-sizing: border-box;
      }
      .container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      .element {
        display: flex;
        flex-direction: column;
        position: absolute;
        padding: 2rem;
        background-color: transparent;
        opacity: 0;
        animation: fade-in 1.5s forwards;
        align-items: center;
        justify-content: center;
      }
      .time,
      .date {
        text-align: center;
        line-height: normal;
        white-space: nowrap;
        transition: all 0.5s ease-in-out;
      }
      .time {
        font-size: 7rem;
        font-weight: 300;
        color: rgb(140, 140, 140);
      }
      .date {
        font-size: 2.5rem;
        font-weight: 200;
        color: rgb(140, 140, 140);
      }
      .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: transparent;
      }
      .logo img {
        object-fit: contain;
        width: 150px;
        opacity: 0.5;
      }
      .name {
        margin-top: 10px;
        padding: 0.5rem 1rem;
        background-color: rgba(200, 200, 200, 0.5);
        color: rgba(0, 0, 0, 1);
        font-size: 1.5rem;
        font-weight: 400;
        text-align: center;
        border-radius: 0.25rem;
        word-wrap: break-word;
        width: 100%;
      }
      @keyframes fade-in {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
      @keyframes fade-out {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
    `;
  }

  public setConfig(config: Config): void {
    if (!config) throw new Error("Invalid configuration provided");
    this.config = config;
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
      const rebootDevicesState =
        this.hass.states["input_button.reboot_devices"]?.state;
      if (this.rebootDevicesState !== rebootDevicesState) {
        this.rebootDevicesState = rebootDevicesState;
      }
      const refreshDevicesState =
        this.hass.states["input_button.refresh_devices"]?.state;
      if (this.refreshDevicesState !== refreshDevicesState) {
        this.refreshDevicesState = refreshDevicesState;
      }
    }
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;

    return html`
      <div class="container">
        <div class="element">
          ${this.config?.display === "logo"
            ? html`
                <div class="logo">
                  <img
                    src=${logoImage}
                    alt="Logo"
                    @error=${() => this.handleImageError()}
                  />
                  ${this.config.name
                    ? html` <div class="name">${this.config.name}</div> `
                    : ""}
                </div>
              `
            : html`
                <div class="time">${this.time}</div>
                <div class="date">${this.date}</div>
              `}
        </div>
      </div>
    `;
  }

  protected firstUpdated(changedProps: PropertyValues): void {
    this.updateElement();
    this.startClock();
    this.cycleElement();
  }

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
      if (this.initialized) {
        if (changedProps.has("rebootDevicesState")) deviceReboot();
        if (changedProps.has("refreshDevicesState")) deviceRefresh();
      } else {
        this.initialized = true;
      }
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timeIntervalId !== undefined) {
      window.clearInterval(this.timeIntervalId);
    }
    if (this.moveTimerId !== undefined) {
      window.clearTimeout(this.moveTimerId);
    }
  }

  private startClock(): void {
    this.timeIntervalId = window.setInterval(() => {
      this.updateElement();
    }, 1000);
  }

  private cycleElement(): void {
    const element = this.shadowRoot?.querySelector(".element") as HTMLElement;
    if (!element) {
      console.error("Element not found in shadow DOM.");
      return;
    }

    const moveTimer = (this.config?.move_timer ?? 30) * 1000;

    if (element) {
      element.style.animation = "fade-in 1.5s forwards";

      setTimeout(() => {
        element.style.animation = "";
        setTimeout(() => {
          element.style.animation = "fade-out 1s forwards";
          setTimeout(() => {
            this.moveElement();
            element.style.animation = "fade-in 1s forwards";
            this.cycleElement();
          }, 1500);
        }, moveTimer);
      }, 1500);
    }
  }

  private updateElement(): void {
    const now = new Date();
    this.time = formattedTime(now);
    this.date = formattedDate(now);
  }

  private moveElement(): void {
    const container = this.shadowRoot?.querySelector(
      ".container"
    ) as HTMLElement;
    const element = this.shadowRoot?.querySelector(".element") as HTMLElement;

    if (container && element) {
      const maxWidth = container.clientWidth - element.clientWidth;
      const maxHeight = container.clientHeight - element.clientHeight;

      const randomX = Math.max(0, Math.floor(Math.random() * maxWidth));
      const randomY = Math.max(0, Math.floor(Math.random() * maxHeight));

      element.style.left = `${randomX}px`;
      element.style.top = `${randomY}px`;
    }
  }

  private handleImageError(): void {
    console.error("Failed to load image.");
  }
}
