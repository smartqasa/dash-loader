import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardConfig } from './types';

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

  @property({ type: Boolean, reflect: true, attribute: 'admin-view' })
  adminView = false;

  @state() isMainLoaded = false;

  public getCardSize(): number | Promise<number> {
    return 20;
  }

  public setConfig(config: LovelaceCardConfig): void {
    this.config = config;
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (!changedProps.has('hass') || !this.hass) return;

    const hass = this.hass;

    const isAdmin = hass.user?.is_admin === true;

    const states = hass.states;
    const isAdminMode = states['input_boolean.admin_mode']?.state === 'on';
    const isDemoMode = states['input_boolean.demo_mode']?.state === 'on';

    const nextAdminView = isAdmin || (isAdminMode && !isDemoMode);

    if (this.adminView !== nextAdminView) {
      this.adminView = nextAdminView;
    }
  }

  protected render(): TemplateResult {
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

  protected updated(): void {
    if (!this.isMainLoaded) this.loadMainCard();
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

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100dvh;
        background-color: var(--panel-color);
      }

      :host([admin-view]) {
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
