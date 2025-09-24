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
  saver_type?: "time" | "logo";
  saver_title?: string;
  saver_interval?: number;
}

window.customCards.push({
  type: "screensaver-card",
  name: "Screen Saver Card",
  preview: true,
  description: "A SmartQasa card for displaying a screen saver.",
});

@customElement("screensaver-card")
export class ScreenSaver extends LitElement implements LovelaceCard {
  public getCardSize(): number | Promise<number> {
    return 100;
  }

  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() time: string = "Loading...";
  @state() date: string = "Loading...";

  private rebootTime?: string;
  private refreshTime?: string;
  private moveTimerId?: number;
  private timeIntervalId?: number;

  public setConfig(config: Config): void {
    this.config = config;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    try {
      window.smartqasa?.popupClose?.();
    } catch (err) {
      console.error("[ScreenSaver] popupClose failed:", err);
    }
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;

    return html`
      <div class="container">
        <div class="element">
          ${this.config?.saver_type === "logo"
            ? html`
                <div class="logo">
                  <img
                    src=${logoImage}
                    alt="Logo"
                    @error=${() => this.handleImageError()}
                  />
                  ${this.config.saver_title
                    ? html` <div class="name">${this.config.saver_title}</div> `
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

  protected firstUpdated(_changedProps: PropertyValues): void {
    this.updateElement();
    this.startClock();
    this.cycleElement();
  }

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
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

  public disconnectedCallback(): void {
    if (this.timeIntervalId !== undefined) {
      window.clearInterval(this.timeIntervalId);
    }
    if (this.moveTimerId !== undefined) {
      window.clearInterval(this.moveTimerId);
    }

    super.disconnectedCallback();
  }

  private startClock(): void {
    this.timeIntervalId = window.setInterval(() => {
      this.updateElement();
    }, 1000);
  }

  private cycleElement(): void {
    const moveTimer = (this.config?.saver_interval ?? 30) * 1000;

    const runCycle = () => {
      const element = this.shadowRoot?.querySelector(
        ".element"
      ) as HTMLElement | null;
      if (!element) {
        console.warn("[ScreenSaver] .element not found during cycle");
        return;
      }

      element.classList.add("hidden");

      setTimeout(() => {
        this.moveElement();
        const el = this.shadowRoot?.querySelector(
          ".element"
        ) as HTMLElement | null;
        if (el) {
          el.classList.remove("hidden");
        } else {
          console.warn("[ScreenSaver] .element missing during fade-in");
        }
      }, 1000);
    };

    runCycle();

    this.moveTimerId = window.setInterval(runCycle, moveTimer);
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

      const randomX = Math.floor(Math.random() * maxWidth);
      const randomY = Math.floor(Math.random() * maxHeight);

      element.style.left = `${randomX}px`;
      element.style.top = `${randomY}px`;
    }
  }

  private handleImageError(): void {
    console.error("Failed to load image.");
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: black;
        z-index: 1000;
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
        align-items: center;
        justify-content: center;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        opacity: 1;
        transition: opacity 1000ms ease-in-out;
      }

      .element.hidden {
        opacity: 0;
      }

      .time,
      .date {
        text-align: center;
        line-height: normal;
        white-space: nowrap;
        transition: all 0.5s ease-in-out;
        max-width: 100vw;
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
    `;
  }
}
