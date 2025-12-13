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
  interface HASSDomEvents {
    'value-changed': {
      value: unknown;
    };
    change: undefined;
  }
}

export type ActionItem =
  | {
      type: 'service' | 'action';
      service: string;
      data?: Record<string, any>;
      target?: Record<string, any>;
    }
  | {
      type: 'function';
      function: string;
      arguments?: any[];
    };

export interface AreaRegistryEntry extends RegistryEntry {
  aliases: string[];
  area_id: string;
  floor_id: string | null;
  humidity_entity_id: string | null;
  icon: string | null;
  labels: string[];
  name: string;
  picture: string | null;
  temperature_entity_id: string | null;
}

export type ConfirmConfig = {
  header?: string;
  message?: string;
  cancel?: string;
  proceed?: string;
};

export interface ConfirmElement extends LovelaceCard {
  config: ConfirmConfig;
  isOpen: boolean;
  open(config: ConfirmConfig): void;
}

export interface Context {
  id: string;
  parent_id?: string;
  user_id?: string | null;
}

export interface CoreFrontendUserData {
  showAdvanced?: boolean;
  showEntityIdPicker?: boolean;
  default_panel?: string;
}

export interface CoreFrontendSystemData {
  default_panel?: string;
}

export interface Credential {
  auth_provider_type: string;
  auth_provider_id: string;
}

export interface CurrentUser {
  id: string;
  is_owner: boolean;
  is_admin: boolean;
  name: string;
  credentials: Credential[];
  mfa_modules: MFAModule[];
}

export interface CustomObj {
  icon: string;
  icon_entity?: string;
  show_info?: boolean;
  info_entity?: string;
  info_entity_units?: string;
  name?: string;
  data: any;
}

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
  entry_type: 'service' | 'device' | null;
  disabled_by: 'user' | 'integration' | 'config_entry' | null;
  configuration_url: string | null;
}

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

type EntityNameItem =
  | {
      type: 'entity' | 'device' | 'area' | 'floor';
    }
  | {
      type: 'text';
      text: string;
    };

interface EntityNameOptions {
  separator?: string;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  aliases?: string[];
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
}

export interface FloorRegistryEntry extends RegistryEntry {
  floor_id: string;
  name: string;
  level: number | null;
  icon: string | null;
  aliases: string[];
}

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

export interface HomeAssistant {
  auth: Auth;
  connection: Connection;
  connected: boolean;
  states: HassEntities;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  floors: Record<string, FloorRegistryEntry>;
  services: HassServices;
  config: HassConfig;
  themes: Themes;
  selectedTheme: ThemeSettings | null;
  panels: Panels;
  panelUrl: string;
  language: string;
  selectedLanguage: string | null;
  resources: Resources;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  debugConnection: boolean;
  dockedSidebar: 'docked' | 'always_hidden' | 'auto';
  moreInfoEntityId: string | null;
  user?: CurrentUser;
  userData?: CoreFrontendUserData;
  systemData?: CoreFrontendSystemData;
  hassUrl(path?: any): any;
  callService<T = any>(
    domain: ServiceCallRequest['domain'],
    service: ServiceCallRequest['service'],
    serviceData?: ServiceCallRequest['serviceData'],
    target?: ServiceCallRequest['target'],
    notifyOnError?: boolean,
    returnResponse?: boolean
  ): Promise<ServiceCallResponse<T>>;
  callApi<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T>;
  callApiRaw(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<Response>;
  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;
  sendWS(msg: MessageBase): void;
  callWS<T>(msg: MessageBase): Promise<T>;
  formatEntityState(stateObj: HassEntity, state?: string): string;
  formatEntityAttributeValue(
    stateObj: HassEntity,
    attribute: string,
    value?: any
  ): string;
  formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;
  formatEntityName(
    stateObj: HassEntity,
    type: EntityNameItem | EntityNameItem[],
    separator?: EntityNameOptions
  ): string;
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

export interface LovelaceCardEditor extends LovelaceGenericElementEditor {
  setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceGenericElementEditor<C = any> extends HTMLElement {
  hass?: HomeAssistant;
  context?: C;
  setConfig(config: any): void;
  focusYamlEditor?: () => void;
}

export interface LovelaceGridOptions {
  columns?: number | 'full';
  rows?: number | 'auto';
  max_columns?: number;
  min_columns?: number;
  min_rows?: number;
  max_rows?: number;
}

export interface LovelaceLayoutOptions {
  grid_columns?: number | 'full';
  grid_rows?: number | 'auto';
  grid_max_columns?: number;
  grid_min_columns?: number;
  grid_min_rows?: number;
  grid_max_rows?: number;
}

export interface MFAModule {
  id: string;
  name: string;
  enabled: boolean;
}

export interface PanelInfo<T = Record<string, any> | null> {
  component_name: string;
  config: T;
  icon: string | null;
  title: string | null;
  url_path: string;
  config_panel_domain?: string;
  default_visible?: boolean;
}

export type Panels = Record<string, PanelInfo>;

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
  hass?: HomeAssistant;
  isOpen: boolean;
  resetTimer?: () => void;
}

export interface RegistryEntry {
  created_at: number;
  modified_at: number;
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

export interface ServiceCallResponse<T = any> {
  context: Context;
  response?: T;
}

export interface ThemeVars {
  // Incomplete
  'primary-color': string;
  'text-primary-color': string;
  'accent-color': string;
  [key: string]: string;
}

export type Theme = ThemeVars & {
  modes?: {
    light?: ThemeVars;
    dark?: ThemeVars;
  };
};

export interface Themes {
  default_theme: string;
  default_dark_theme: string | null;
  themes: Record<string, Theme>;
  // Currently effective dark mode. Will never be undefined. If user selected "auto"
  // in theme picker, this property will still contain either true or false based on
  // what has been determined via system preferences and support from the selected theme.
  darkMode: boolean;
  // Currently globally active theme name
  theme: string;
}

// Currently selected theme and its settings. These are the values stored in local storage.
// Note: These values are not meant to be used at runtime to check whether dark mode is active
// or which theme name to use, as this interface represents the config data for the theme picker.
// The actually active dark mode and theme name can be read from hass.themes.
export interface ThemeSettings {
  theme: string;
  // Radio box selection for theme picker. Do not use in Lovelace rendering as
  // it can be undefined == auto.
  // Property hass.themes.darkMode carries effective current mode.
  dark?: boolean;
  primaryColor?: string;
  accentColor?: string;
}
