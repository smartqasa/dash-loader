import type {
  Auth,
  Connection,
  HassConfig,
  HassEntities,
  HassEntity,
  HassServices,
  HassServiceTarget,
  MessageBase,
} from 'home-assistant-js-websocket';

declare global {
  // For fire event compatibility
  interface HASSDomEvents {
    /** Fired when a value changes */
    'value-changed': {
      value: unknown;
    };
    /** Fired when a change event occurs */
    change: undefined;
  }
}

/**
 * Defines an action that can be executed.
 * Supports Home Assistant service calls or custom functions.
 */
export type ActionItem =
  | {
      /** Service call (legacy: "action" is also accepted in automations/scripts) */
      type: 'service' | 'action';
      /** e.g., "light.turn_on" */
      service: string;
      /** Data payload for the service */
      data?: Record<string, any>;
      /** Optional target selector */
      target?: Record<string, any>;
    }
  | {
      /** Custom function reference */
      type: 'function';
      /** Function name */
      function: string;
      /** Arguments to pass to the function */
      arguments?: any[];
    };

/**
 * Configuration for confirmation dialogs.
 */
export type ConfirmConfig = {
  header?: string;
  message?: string;
  cancel?: string;
  proceed?: string;
};

/**
 * Custom confirm dialog element.
 */
export interface ConfirmElement extends LovelaceCard {
  config: ConfirmConfig;
  isOpen: boolean;
  open(config: ConfirmConfig): void;
}

/**
 * Context object used in events and service calls.
 */
export interface Context {
  id: string;
  parent_id?: string;
  user_id?: string | null;
}

/** Credential for current user. */
export interface Credential {
  auth_provider_type: string;
  auth_provider_id: string;
}

/** Current user information. */
export interface CurrentUser {
  id: string;
  is_owner: boolean;
  is_admin: boolean;
  name: string;
  credentials: Credential[];
  mfa_modules: MFAModule[];
}

/** Custom object schema for card configs. */
export interface CustomObj {
  icon: string;
  icon_entity?: string;
  show_info?: boolean;
  info_entity?: string;
  info_entity_units?: string;
  name?: string;
  data: any;
}

/** Device registry entry definition. */
export interface DeviceRegistryEntry {
  id: string;
  config_entries: string[];
  connections: Array<[string, string]>;
  identifiers: Array<[string, string]>;
  manufacturer: string | null;
  model: string | null;
  name: string | null;
  labels: string[];
  sw_version: string | null;
  hw_version: string | null;
  serial_number: string | null;
  via_device_id: string | null;
  area_id: string | null;
  name_by_user: string | null;
  /** Device type */
  entry_type: 'service' | 'device' | null;
  disabled_by: 'user' | 'integration' | 'config_entry' | null;
  configuration_url: string | null;
}

/** Dialog entry for UI rendering. */
export interface DialogEntry {
  icon?: string;
  name?: string;
  entity?: string;
  color?: string;
  data: any;
}

export interface DialogTable {
  [key: string]: DialogEntry;
}

type EntityCategory = 'config' | 'diagnostic';

/** Entity registry entry used for display in UI. */
export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  /** Optional aliases */
  aliases?: string[];
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
}

/** Area definition from backend. */
export interface HassArea {
  area_id: string;
  floor_id: string | null;
  name: string;
  picture: string | null;
  icon: string | null;
  labels: string[];
  aliases: string[];
}

export type { HassEntity };

/**
 * The main Home Assistant object available in Lovelace.
 */
export interface HomeAssistant {
  /** Authentication */
  auth: Auth;
  /** WebSocket connection */
  connection: Connection;
  /** Connection state */
  connected: boolean;
  /** Entity states */
  states: HassEntities;
  /** Entity registry cache */
  entities: { [id: string]: EntityRegistryDisplayEntry };
  /** Device registry cache */
  devices: { [id: string]: DeviceRegistryEntry };
  /** Area registry cache */
  areas: { [id: string]: HassArea };
  /** Available services */
  services: HassServices;
  /** Core configuration */
  config: HassConfig;
  /** Current panel URL */
  panelUrl: string;
  /** Selected language */
  language: string;
  selectedLanguage: string | null;
  /** Translation resources */
  resources: Resources;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  dockedSidebar: 'docked' | 'always_hidden' | 'auto';
  defaultPanel: string;
  /** Currently open "more info" entity */
  moreInfoEntityId: string | null;
  /** Current user */
  user?: CurrentUser;
  /** Locale and formatting information */
  locale?: {
    language: string;
    number_format: 'comma_decimal' | 'decimal_comma' | 'space_comma' | 'system';
    time_format: '12' | '24' | 'system';
    first_weekday: 0 | 1 | 'language';
  };

  /**
   * Call a backend service.
   */
  callService(
    domain: ServiceCallRequest['domain'],
    service: ServiceCallRequest['service'],
    serviceData?: ServiceCallRequest['serviceData'],
    target?: ServiceCallRequest['target'],
    cache?: boolean,
    returnResponse?: boolean
  ): Promise<any>;

  /**
   * Call a REST API endpoint.
   */
  callApi<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T>;

  /**
   * Fetch with authentication headers included.
   */
  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;

  /**
   * Send a raw WebSocket message.
   */
  sendWS(msg: MessageBase): void;

  /**
   * Call a WebSocket command.
   */
  callWS<T>(msg: MessageBase): Promise<T>;

  /**
   * Format an entity’s state for display.
   */
  formatEntityState(stateObj: HassEntity, state?: string): string;

  /**
   * Format an attribute value for display.
   */
  formatEntityAttributeValue(
    stateObj: HassEntity,
    attribute: string,
    value?: string
  ): string;

  /**
   * Format an attribute name for display.
   */
  formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;

  /** Active themes */
  themes: Themes;
}

export interface LovelaceDashboardBaseConfig {}

/** Base interface for all Lovelace cards. */
export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  preview?: boolean;
  layout?: string;
  getCardSize(): number | Promise<number>;
  /** @deprecated Use `getGridOptions` instead */
  getLayoutOptions?(): LovelaceLayoutOptions;
  getGridOptions?(): LovelaceGridOptions;
  setConfig(config: LovelaceCardConfig): void;
}

/** Lovelace card configuration. */
export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  /** @deprecated Use `grid_options` instead */
  layout_options?: LovelaceLayoutOptions;
  grid_options?: LovelaceGridOptions;
  type: string;
  [key: string]: any;
  visibility?: boolean;
}

/** Editor for Lovelace cards. */
export interface LovelaceCardEditor extends LovelaceGenericElementEditor {
  setConfig(config: LovelaceCardConfig): void;
}

/** Generic editor element interface. */
export interface LovelaceGenericElementEditor<C = any> extends HTMLElement {
  hass?: HomeAssistant;
  context?: C;
  setConfig(config: any): void;
  focusYamlEditor?: () => void;
}

/** Grid layout options for cards. */
export interface LovelaceGridOptions {
  columns?: number | 'full';
  rows?: number | 'auto';
  max_columns?: number;
  min_columns?: number;
  min_rows?: number;
  max_rows?: number;
}

/** Deprecated grid layout options (legacy). */
export interface LovelaceLayoutOptions {
  grid_columns?: number | 'full';
  grid_rows?: number | 'auto';
  grid_max_columns?: number;
  grid_min_columns?: number;
  grid_min_rows?: number;
  grid_max_rows?: number;
}

/** MFA module definition. */
export interface MFAModule {
  id: string;
  name: string;
  enabled: boolean;
}

/** Configuration for popup dialogs. */
export type PopupConfig = {
  title?: string;
  size?: 'normal' | 'fullscreen';
  dismissable?: boolean;
  timeout?: number;
  scrollable?: boolean;
  orientation?: 'auto' | 'landscape' | 'portrait';
  card: LovelaceCardConfig & { type: string };
  hass?: HomeAssistant;
  button1?: string;
  action1?: ActionItem[];
  button2?: string;
  action2?: ActionItem[];
  button3?: string;
  action3?: ActionItem[];
};

export interface PopupDialogElement extends HTMLElement {
  hass?: HomeAssistant;
}

/** Custom popup element. */
export interface PopupElement extends LovelaceCard {
  config: PopupConfig;
  isOpen: boolean;
}

/** Translation resources */
export interface Resources {
  [language: string]: Record<string, string>;
}

/** Request object for service calls. */
export interface ServiceCallRequest {
  domain: string;
  service: string;
  serviceData?: Record<string, any>;
  target?: HassServiceTarget;
}

/** Response object for service calls. */
export interface ServiceCallResponse {
  context: Context;
}

/** Theme variables (dynamic keys). */
export type ThemeVars = Record<string, string>;

/** A theme with optional light/dark modes. */
export type Theme = ThemeVars & {
  modes?: {
    light?: ThemeVars;
    dark?: ThemeVars;
  };
};

/** All themes and current theme state. */
export interface Themes {
  default_theme: string;
  default_dark_theme: string | null;
  themes: Record<string, Theme>;
  /** Whether dark mode is active */
  darkMode: boolean;
  /** Currently active theme name */
  theme: string;
}
