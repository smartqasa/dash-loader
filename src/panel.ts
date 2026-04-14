import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardConfig } from './types-ha';
import { AccessRestrictionPolicy, Policies } from './types-sq';
import { loadYamlAsJson } from './load-yaml-as-json';

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
  adminView?: boolean;

  @state() isMainLoaded = false;
  @state() restrictionPolicy?: AccessRestrictionPolicy;

  public getCardSize(): number | Promise<number> {
    return 20;
  }

  public setConfig(config: LovelaceCardConfig): void {
    this.config = config;
  }

  protected async willUpdate(changedProps: PropertyValues): Promise<void> {
    if (changedProps.has('config')) {
      await this.loadRestrictPolicy();
    }

    if (
      !this.hass ||
      (!changedProps.has('hass') && !changedProps.has('restrictionPolicy'))
    )
      return;

    const isUserAdmin = this.hass.user?.is_admin === true;
    const states = this.hass.states;
    const isAdminMode = states['input_boolean.admin_mode']?.state === 'on';
    const isDemoMode = states['input_boolean.demo_mode']?.state === 'on';
    const adminView = (isUserAdmin && !isDemoMode) || isAdminMode;

    if (this.adminView !== adminView) this.adminView = adminView;

    const normalize = (value: string): string => value.trim().toLowerCase();

    if (!this.restrictionPolicy) return;

    let enforceRestrictions = true;

    const restrictedModes = this.restrictionPolicy.restricted_modes ?? [];
    const allowAdminMode = this.restrictionPolicy.allow_admin_mode === true;
    const allowAdminUsers = this.restrictionPolicy.allow_admin_users === true;
    const allowedUsers = this.restrictionPolicy.allowed_users ?? [];

    const currentMode =
      this.hass.states['input_select.location_mode']?.state ?? '';

    const normalizedRestrictedModes = restrictedModes.map(normalize);
    const normalizedCurrentMode = normalize(currentMode);

    const normalizedAllowedUsers = allowedUsers.map(normalize);
    const normalizedCurrentUser = normalize(this.hass.user?.name ?? '');

    const restrictCurrentMode =
      normalizedRestrictedModes.length === 0 ||
      normalizedRestrictedModes.includes(normalizedCurrentMode);

    const isAllowedUser = normalizedAllowedUsers.includes(
      normalizedCurrentUser
    );

    if (!restrictCurrentMode) {
      enforceRestrictions = false;
    } else if (allowAdminMode && isAdminMode) {
      enforceRestrictions = false;
    } else if (allowAdminUsers && isUserAdmin) {
      enforceRestrictions = false;
    } else if (isAllowedUser) {
      enforceRestrictions = false;
    }

    window.smartqasa.enforceRestrictions = enforceRestrictions;
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
    if (!this.isMainLoaded) void this.loadMainCard();
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

  private async loadRestrictPolicy(): Promise<void> {
    const resetRestrictionState = (): void => {
      this.restrictionPolicy = undefined;
      window.smartqasa.enforceRestrictions = false;
      window.smartqasa.restrictions = {
        domains: [],
        home: false,
        areas: false,
        menu: false,
        restricted_modes: [],
        allow_admin_mode: false,
        allow_admin_users: false,
        allowed_users: [],
      };
    };

    try {
      const policies = await loadYamlAsJson<Policies>(
        '/local/smartqasa/custom/policies.yaml',
        false
      );

      if (!policies?.access_restriction) {
        resetRestrictionState();
        return;
      }

      this.restrictionPolicy = policies.access_restriction;
      window.smartqasa.restrictions = {
        domains: policies.access_restriction.domains ?? [],
        home: policies.access_restriction.home ?? false,
        areas: policies.access_restriction.areas ?? false,
        menu: policies.access_restriction.menu ?? false,
        restricted_modes: policies.access_restriction.restricted_modes ?? [],
        allow_admin_mode: policies.access_restriction.allow_admin_mode ?? false,
        allow_admin_users:
          policies.access_restriction.allow_admin_users ?? false,
        allowed_users: policies.access_restriction.allowed_users ?? [],
      };
    } catch {
      resetRestrictionState();
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
