import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  HomeAssistant,
  LovelaceCardConfig,
  PopupDialogElement,
} from '../types';
import { SettingsStorage, BrightnessMap } from '../utilities/settings-storage';
import {
  deviceFlash,
  deviceRefresh,
  deviceReboot,
} from '../utilities/device-actions';
import { setDisplayMode } from '../utilities/set-display-mode';

window.customCards ??= [];
window.customCards.push({
  type: 'panel-card',
  name: 'Panel Card',
  preview: true,
  description: 'A SmartQasa card for displaying the Main panel card.',
});

@customElement('panel-card')
export class PanelCard extends LitElement {
  @property({ attribute: false }) config?: LovelaceCardConfig;
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() isMainLoaded = false;

  private isAdminView = false;
  private phase: string | null = null;
  private flashTime: string | null = null;
  private rebootTime: string | null = null;
  private refreshTime: string | null = null;

  public getCardSize(): number | Promise<number> {
    return 20;
  }

  public setConfig(config: LovelaceCardConfig): void {
    this.config = config;
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('hass') && this.hass) {
      const isAdmin = this.hass?.user?.is_admin || false;
      const isAdminMode =
        this.hass.states?.['input_boolean.admin_mode']?.state === 'on' || false;
      this.isAdminView = isAdmin || isAdminMode;
    }
  }

  protected render(): TemplateResult {
    this.classList.toggle('admin-view', this.isAdminView);

    if (!this.isMainLoaded) {
      return html`
        <div class="loader">
          <div class="loader-text">SmartQasa is loading</div>
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
      `;
    }

    return html`
      <main-card .config=${this.config} .hass=${this.hass}></main-card>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    if (!this.isMainLoaded) this.loadMainCard();

    if (changedProps.has('hass') && this.hass) {
      this.syncPopups();
      this.checkDeviceTriggers();
      this.handlePhaseChange();
      this.handleSunChange();
    }
  }

  private async loadMainCard(retries = 5): Promise<void> {
    try {
      await customElements.whenDefined('main-card');
    } catch (err) {
      console.error('[PanelCard] whenDefined failed:', err);
      if (retries > 0) {
        setTimeout(() => this.loadMainCard(retries - 1), 1000);
      }
      return;
    }

    this.isMainLoaded = true;
  }

  private syncPopups(): void {
    if (!this.hass) return;

    document.querySelectorAll('popup-dialog').forEach((popup) => {
      if ((popup as PopupDialogElement).hass !== undefined) {
        (popup as PopupDialogElement).hass = this.hass;
      }
    });
  }

  private handlePhaseChange(): void {
    if (typeof window.fully === 'undefined' || !this.hass) return;

    const activePhase =
      this.hass.states?.['input_select.location_phase']?.state;
    if (!activePhase || activePhase === this.phase) return;

    try {
      const settings = SettingsStorage.read();
      const brightnessMap = (settings?.brightnessMap ?? {}) as BrightnessMap;
      if (activePhase in brightnessMap) {
        const value = brightnessMap[activePhase];
        window.fully.setStringSetting('screenBrightness', String(value));
        window.fully.setStringSetting('screensaverBrightness', String(value));
        this.phase = activePhase;
      }
    } catch (err) {
      console.warn(
        '[PanelCard] Failed to update brightness on phase change:',
        err
      );
    }
  }

  private handleSunChange(): void {
    const sun = this.hass?.states['sun.sun'];
    if (sun) {
      const isDay = sun.state === 'above_horizon';
      setDisplayMode(isDay ? 'light' : 'dark');
    }
  }

  private checkDeviceTriggers(): void {
    if (!this.hass) return;

    const triggers = [
      {
        key: 'flash',
        entity: 'input_button.flash_devices',
        action: deviceFlash,
      },
      {
        key: 'reboot',
        entity: 'input_button.reboot_devices',
        action: deviceReboot,
      },
      {
        key: 'refresh',
        entity: 'input_button.refresh_devices',
        action: deviceRefresh,
      },
    ];

    for (const { key, entity, action } of triggers) {
      const state = this.hass.states?.[entity]?.state;
      const lastTime = (this as any)[`${key}Time`];

      if (lastTime !== null && state !== lastTime) {
        try {
          action();
        } catch (err) {
          console.error(`[PanelCard] Device ${key} failed:`, err);
        }
      }

      (this as any)[`${key}Time`] = state || null;
    }
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100dvh;
        background-color: var(--panel-color);
      }

      :host(.admin-view) {
        height: calc(100dvh - 56px);
      }

      .loader {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .loader-text {
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
