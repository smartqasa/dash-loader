import type {
  Auth,
  Connection,
  HassConfig,
  HassEntities,
  HassEntity,
  HassServices,
  HassServiceTarget,
  MessageBase,
} from "home-assistant-js-websocket";

declare global {
  // for fire event
  interface HASSDomEvents {
    "value-changed": {
      value: unknown;
    };
    change: undefined;
  }
}

export type ActionItem =
  | {
      type: "service";
      service: string;
      data?: Record<string, any>;
      target?: Record<string, any>;
    }
  | {
      type: "function";
      function: string;
      arguments?: any[];
    };

export type ConfirmConfig = {
  title: string;
  message: string;
  button1?: string;
  action1?: ActionItem[];
  button2?: string;
  action2?: ActionItem[];
};

export interface ConfirmElement extends LovelaceCard {
  config: ConfirmConfig;
  isOpen: boolean;
}

export interface Context {
  id: string;
  parent_id?: string;
  user_id?: string | null;
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
  entry_type: "service" | null;
  disabled_by: "user" | "integration" | "config_entry" | null;
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

type EntityCategory = "config" | "diagnostic";

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
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
  entities: { [id: string]: EntityRegistryDisplayEntry };
  devices: { [id: string]: DeviceRegistryEntry };
  areas: { [id: string]: HassArea };
  services: HassServices;
  config: HassConfig;
  panelUrl: string;
  language: string;
  selectedLanguage: string | null;
  resources: Resources;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  dockedSidebar: "docked" | "always_hidden" | "auto";
  defaultPanel: string;
  moreInfoEntityId: string | null;
  user?: CurrentUser;
  /*
  callService(
    domain: ServiceCallRequest['domain'],
    service: ServiceCallRequest['service'],
    serviceData?: ServiceCallRequest['serviceData'],
    target?: ServiceCallRequest['target']
  ): Promise<ServiceCallResponse>;
  */
  callService(
    domain: ServiceCallRequest["domain"],
    service: ServiceCallRequest["service"],
    serviceData?: ServiceCallRequest["serviceData"],
    target?: ServiceCallRequest["target"],
    cache?: boolean,
    returnResponse?: boolean
  ): Promise<any>;
  callApi<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T>;
  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;
  sendWS(msg: MessageBase): void;
  callWS<T>(msg: MessageBase): Promise<T>;
  formatEntityState(stateObj: HassEntity, state?: string): string;
  formatEntityAttributeValue(
    stateObj: HassEntity,
    attribute: string,
    value?: string
  ): string;
  formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;
  themes: Themes;
}

export interface LovelaceDashboardBaseConfig {}

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
  columns?: number | "full";
  rows?: number | "auto";
  max_columns?: number;
  min_columns?: number;
  min_rows?: number;
  max_rows?: number;
}

export interface LovelaceLayoutOptions {
  grid_columns?: number | "full";
  grid_rows?: number | "auto";
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

export type PopupConfig = {
  title?: string;
  size?: "normal" | "fullscreen";
  dismissable?: boolean;
  timeout?: number;
  scrollable?: boolean;
  card: LovelaceCardConfig & { type: string };
  hass?: HomeAssistant;
  button1?: string;
  action1?: ActionItem[];
  button2?: string;
  action2?: ActionItem[];
  button3?: string;
  action3?: ActionItem[];
};

export interface PopupElement extends LovelaceCard {
  config: PopupConfig;
  isOpen: boolean;
}

export interface Resources {
  [language: string]: Record<string, string>;
}

export interface ServiceCallRequest {
  domain: string;
  service: string;
  serviceData?: Record<string, any>;
  target?: HassServiceTarget;
}

export interface ServiceCallResponse {
  context: Context;
}

export interface ThemeVars {
  // Incomplete
  "primary-color": string;
  "text-primary-color": string;
  "accent-color": string;
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
