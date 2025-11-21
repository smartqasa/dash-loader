import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
  TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from '../types';
import { formattedDate, formattedTime } from '../utilities/format-date-time';
import { deviceRefresh, deviceReboot } from '../utilities/device-actions';
import logoImage from '../assets/logo.png';

interface Config extends LovelaceCardConfig {
  saver_type?: 'time' | 'logo';
  saver_title?: string;
  saver_interval?: number; // seconds
}

/*
window.customCards.push({
  type: "screensaver-card",
  name: "Screen Saver Card",
  preview: true,
  description: "A SmartQasa card for displaying a screen saver.",
});
*/

@customElement('screensaver-card')
export class ScreenSaver extends LitElement implements LovelaceCard {
  public getCardSize(): number | Promise<number> {
    return 20;
  }

  @property({ attribute: false }) config?: Config;
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() time: string = 'Loading...';
  @state() date: string = 'Loading...';

  private rebootTime?: string;
  private refreshTime?: string;

  // Timers
  private moveTimerId?: number;
  private timeIntervalId?: number;
  private fadeTimeoutId?: number;
  private watchdogId?: number;

  // Observers
  private resizeObs?: ResizeObserver;
  private interObs?: IntersectionObserver;

  // Heartbeats
  private lastClockBeat = 0;
  private lastMoveBeat = 0;

  // ---------- Utils ----------

  private get containerEl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.container') as HTMLElement | null;
  }
  private get elementEl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.element') as HTMLElement | null;
  }

  private clamp(n: number, min: number, max: number): number {
    if (Number.isNaN(n)) return min;
    if (min > max) return min;
    return Math.min(Math.max(n, min), max);
  }

  private now(): number {
    return (window.performance && performance.now()) || Date.now();
  }

  // ---------- Lovelace plumbing ----------

  public setConfig(config: Config): void {
    this.config = config;
  }

  // ---------- Lifecycle ----------

  public connectedCallback(): void {
    super.connectedCallback();
    window.smartqasa?.popupReset?.();

    // Start immediately
    this.updateElement();
    if (this.timeIntervalId === undefined) this.startClock();
    if (this.moveTimerId === undefined) this.cycleElement();

    // Wake lock
    if (
      navigator.wakeLock &&
      typeof navigator.wakeLock.request === 'function'
    ) {
      navigator.wakeLock
        .request('screen')
        .then((wakeLock) => {
          console.log('[ScreenSaver] Wake lock acquired:', wakeLock);
        })
        .catch((err) => {
          console.error('[ScreenSaver] Wake lock request failed:', err);
        });
    }

    // Page visibility / focus
    document.addEventListener('visibilitychange', this.handleVisibility, {
      passive: true,
    });
    window.addEventListener('focus', this.handleVisibility, { passive: true });

    // Keep element in-bounds on layout changes
    this.resizeObs = new ResizeObserver(() => this.ensureInBounds());
    const container = this.containerEl;
    if (container) this.resizeObs.observe(container);

    // If element ever leaves viewport, snap back
    this.interObs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          this.recenterElement();
          this.elementEl?.classList.remove('hidden');
        }
      },
      { root: null, threshold: 0.01 }
    );
    const el = this.elementEl;
    if (el) this.interObs.observe(el);

    // Start watchdog
    this.startWatchdog();

    setInterval(() => {
      if (window.fully && typeof window.fully.isInForeground === 'function') {
        // This call is harmless but marks the WebView as "active"
        window.fully.getScreenBrightness();
      }
    }, 15000);
  }

  public disconnectedCallback(): void {
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibility as any
    );
    window.removeEventListener('focus', this.handleVisibility as any);

    this.stopClock();
    this.stopMoveCycle();
    this.stopWatchdog();

    this.resizeObs?.disconnect();
    this.resizeObs = undefined;

    this.interObs?.disconnect();
    this.interObs = undefined;

    super.disconnectedCallback();
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;

    return html`
      <div class="container">
        <div class="element">
          ${this.config?.saver_type === 'logo'
            ? html`
                <div class="logo">
                  <img
                    src=${logoImage}
                    alt="Logo"
                    @error=${() => this.handleImageError()}
                  />
                  ${this.config.saver_title
                    ? html`<div class="name">${this.config.saver_title}</div>`
                    : nothing}
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
    super.firstUpdated(changedProps);
    if (this.moveTimerId === undefined) this.cycleElement();
  }

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has('hass') && this.hass) {
      const rebootTime = this.hass.states['input_button.reboot_devices']?.state;
      if (this.rebootTime !== undefined && this.rebootTime !== rebootTime) {
        deviceReboot();
      }
      this.rebootTime = rebootTime;

      const refreshTime =
        this.hass.states['input_button.refresh_devices']?.state;
      if (this.refreshTime !== undefined && this.refreshTime !== refreshTime) {
        deviceRefresh();
      }
      this.refreshTime = refreshTime;
    }
  }

  // ---------- Visibility / Watchdog ----------

  private handleVisibility = (): void => {
    if (document.visibilityState === 'visible') {
      const now = this.now();

      // Clock stale? Restart.
      if (now - this.lastClockBeat > 5_000) {
        this.stopClock();
        this.startClock();
      }

      // Move cycle stale? Restart.
      const moveTimerMs = Math.max(1, this.config?.saver_interval ?? 30) * 1000;
      if (now - this.lastMoveBeat > moveTimerMs * 1.5) {
        this.stopMoveCycle();
        this.cycleElement();
      }

      // Make sure it's onscreen
      this.ensureInBounds();
    }
  };

  // ---------- Watchdog ----------

  private startWatchdog(): void {
    if (this.watchdogId !== undefined) return;

    const check = () => {
      if (!this.isConnected) return;

      const now = this.now();
      console.log(
        `[ScreenSaver] Watchdog check at ${new Date().toISOString()}`
      );

      // Clock check
      if (now - this.lastClockBeat > 5000) {
        console.warn('[ScreenSaver] Restarting stalled clock');
        this.stopClock();
        this.startClock();
      }

      // Move check
      const moveTimerMs = Math.max(1, this.config?.saver_interval ?? 30) * 1000;
      if (now - this.lastMoveBeat > moveTimerMs * 1.5) {
        console.warn('[ScreenSaver] Restarting stalled move cycle');
        this.stopMoveCycle();
        this.cycleElement();
      }

      this.watchdogId = window.setTimeout(check, 2000);
    };

    check();
  }

  private stopWatchdog(): void {
    if (this.watchdogId !== undefined) {
      window.clearTimeout(this.watchdogId);
      this.watchdogId = undefined;
    }
  }

  // ---------- Clock ----------

  private startClock(): void {
    if (this.timeIntervalId !== undefined) return;

    const tick = () => {
      if (!this.isConnected) return;

      const now = this.now();
      if (now - this.lastClockBeat > 5000) {
        console.warn(
          `[ScreenSaver] Clock was stalled; restarting. Last beat: ${this.lastClockBeat}`
        );
      }

      this.updateElement();
      this.lastClockBeat = now;

      this.timeIntervalId = window.setTimeout(tick, 1000);
    };

    tick();
  }

  private stopClock(): void {
    if (this.timeIntervalId !== undefined) {
      window.clearTimeout(this.timeIntervalId);
      this.timeIntervalId = undefined;
    }
  }

  private updateElement(): void {
    const now = new Date();
    this.time = formattedTime(now);
    this.date = formattedDate(now);
  }

  // ---------- Movement Cycle ----------

  private cycleElement(): void {
    const moveTimerMs = Math.max(1, this.config?.saver_interval ?? 30) * 1000;

    const runCycle = () => {
      if (!this.isConnected) return;

      const now = this.now();
      if (now - this.lastMoveBeat > moveTimerMs * 1.5) {
        console.warn(
          `[ScreenSaver] Move cycle was stalled; restarting. Last beat: ${this.lastMoveBeat}`
        );
      }

      const element = this.elementEl;
      if (!element) {
        console.warn('[ScreenSaver] .element not found during cycle');
        return;
      }

      element.classList.add('hidden');

      this.fadeTimeoutId = window.setTimeout(() => {
        if (!this.isConnected) return;

        this.moveElement();
        this.ensureInBounds();

        const el = this.elementEl;
        if (el) el.classList.remove('hidden');
        else console.warn('[ScreenSaver] .element missing during fade-in');

        this.lastMoveBeat = this.now();

        // Chain the next cycle
        this.moveTimerId = window.setTimeout(runCycle, moveTimerMs);
      }, 1000);
    };

    runCycle();
  }

  private stopMoveCycle(): void {
    if (this.moveTimerId !== undefined) {
      window.clearTimeout(this.moveTimerId);
      this.moveTimerId = undefined;
    }
    if (this.fadeTimeoutId !== undefined) {
      window.clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = undefined;
    }
  }

  private moveElement(): void {
    if (!this.isConnected) return;

    const container = this.containerEl;
    const element = this.elementEl;
    if (!container || !element) return;

    const cw = Math.max(0, container.clientWidth);
    const ch = Math.max(0, container.clientHeight);
    const ew = Math.max(0, element.clientWidth);
    const eh = Math.max(0, element.clientHeight);

    const maxX = Math.max(0, cw - ew);
    const maxY = Math.max(0, ch - eh);

    const randomX = Math.floor(Math.random() * (maxX + 1));
    const randomY = Math.floor(Math.random() * (maxY + 1));

    element.style.left = `${this.clamp(randomX, 0, maxX)}px`;
    element.style.top = `${this.clamp(randomY, 0, maxY)}px`;
  }

  private ensureInBounds(): void {
    const container = this.containerEl;
    const element = this.elementEl;
    if (!container || !element) return;

    const cw = Math.max(0, container.clientWidth);
    const ch = Math.max(0, container.clientHeight);
    const ew = Math.max(0, element.clientWidth);
    const eh = Math.max(0, element.clientHeight);

    const maxX = Math.max(0, cw - ew);
    const maxY = Math.max(0, ch - eh);

    const currentX = parseFloat(element.style.left || '0') || 0;
    const currentY = parseFloat(element.style.top || '0') || 0;

    const safeX = this.clamp(currentX, 0, maxX);
    const safeY = this.clamp(currentY, 0, maxY);

    if (safeX !== currentX) element.style.left = `${safeX}px`;
    if (safeY !== currentY) element.style.top = `${safeY}px`;

    const rect = element.getBoundingClientRect();
    const vw = window.innerWidth || cw;
    const vh = window.innerHeight || ch;

    const offscreen =
      rect.right < 0 || rect.bottom < 0 || rect.left > vw || rect.top > vh;

    if (offscreen) this.recenterElement();
  }

  private recenterElement(): void {
    const container = this.containerEl;
    const element = this.elementEl;
    if (!container || !element) return;

    const cw = Math.max(0, container.clientWidth);
    const ch = Math.max(0, container.clientHeight);
    const ew = Math.max(0, element.clientWidth);
    const eh = Math.max(0, element.clientHeight);

    const cx = cw / 2;
    const cy = ch / 2;

    element.style.left = `${this.clamp(cx - ew / 2, 0, Math.max(0, cw - ew))}px`;
    element.style.top = `${this.clamp(cy - eh / 2, 0, Math.max(0, ch - eh))}px`;
  }

  private handleImageError(): void {
    console.error('Failed to load image.');
  }

  // ---------- Styles ----------

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
        animation: nudge 2s infinite linear;
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

      @keyframes nudge {
        0% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(0.001px, 0, 0);
        }
        100% {
          transform: translate3d(0, 0, 0);
        }
      }
    `;
  }
}
