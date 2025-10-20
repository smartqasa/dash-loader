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

/*
window.customCards.push({
  type: "screensaver-card",
  name: "Screen Saver Card",
  preview: true,
  description: "A SmartQasa card for displaying a screen saver.",
});
*/

@customElement("screensaver-card")
export class ScreenSaver extends LitElement implements LovelaceCard {
  public getCardSize(): number | Promise<number> {
    return 20;
  }

  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() time: string = "Loading...";
  @state() date: string = "Loading...";

  private rebootTime?: string;
  private refreshTime?: string;

  private moveTimerId?: number;
  private timeIntervalId?: number;
  private fadeTimeoutId?: number;

  public setConfig(config: Config): void {
    this.config = config;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.smartqasa?.popupReset?.();

    this.updateElement();

    if (this.timeIntervalId === undefined) this.startClock();

    if (this.moveTimerId === undefined) this.cycleElement();
  }

  public disconnectedCallback(): void {
    if (this.timeIntervalId !== undefined) {
      window.clearInterval(this.timeIntervalId);
      this.timeIntervalId = undefined;
    }
    if (this.moveTimerId !== undefined) {
      window.clearInterval(this.moveTimerId);
      this.moveTimerId = undefined;
    }
    if (this.fadeTimeoutId !== undefined) {
      window.clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = undefined;
    }
    super.disconnectedCallback();
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

  private startClock(): void {
    this.timeIntervalId = window.setInterval(() => {
      if (!this.isConnected) {
        if (this.timeIntervalId !== undefined) {
          window.clearInterval(this.timeIntervalId);
          this.timeIntervalId = undefined;
        }
        return;
      }
      this.updateElement();
    }, 1000);
  }

  private cycleElement(): void {
    const moveTimerMs = Math.max(1, this.config?.saver_interval ?? 30) * 1000;

    const runCycle = () => {
      if (!this.isConnected) return;

      const element = this.shadowRoot?.querySelector(
        ".element"
      ) as HTMLElement | null;

      if (!element) {
        console.warn("[ScreenSaver] .element not found during cycle");
        return;
      }

      element.classList.add("hidden");

      this.fadeTimeoutId = window.setTimeout(() => {
        if (!this.isConnected) return;

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

    this.moveTimerId = window.setInterval(() => {
      if (!this.isConnected) {
        if (this.moveTimerId !== undefined) {
          window.clearInterval(this.moveTimerId);
          this.moveTimerId = undefined;
        }
        return;
      }
      runCycle();
    }, moveTimerMs);
  }

  private updateElement(): void {
    const now = new Date();
    this.time = formattedTime(now);
    this.date = formattedDate(now);
  }

  private moveElement(): void {
    if (!this.isConnected) return;

    const container = this.shadowRoot?.querySelector(
      ".container"
    ) as HTMLElement | null;
    const element = this.shadowRoot?.querySelector(
      ".element"
    ) as HTMLElement | null;

    if (container && element) {
      const maxWidth = Math.max(0, container.clientWidth - element.clientWidth);
      const maxHeight = Math.max(
        0,
        container.clientHeight - element.clientHeight
      );

      const randomX = Math.floor(Math.random() * (maxWidth + 1));
      const randomY = Math.floor(Math.random() * (maxHeight + 1));

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
        width: 100dvw;
        height: 100dvh;
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
