import type {
  LovelaceCard,
  LovelaceCardConfig,
  HomeAssistant,
} from './types-ha';

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

export interface CustomObj {
  icon: string;
  icon_entity?: string;
  show_info?: boolean;
  info_entity?: string;
  info_entity_units?: string;
  name?: string;
  data: any;
}

export interface DialogEntry {
  icon?: string;
  name?: string;
  entity?: string;
  color?: string;
  data: any;
}

export interface AccessRestrictionPolicy {
  domains: string[];
  home: boolean;
  areas: boolean;
  menu: boolean;
  restricted_modes?: string[];
  allow_admin_mode?: boolean;
  allow_admin_users?: boolean;
  allowed_users?: string[];
}

export interface DialogTable {
  [key: string]: DialogEntry;
}

export interface Policies {
  access_restriction?: AccessRestrictionPolicy;
}

export type PopupConfig = {
  title?: string;
  size?: 'normal' | 'fullscreen';
  dismissable?: boolean;
  timeout?: number;
  scrollable?: boolean;
  orientation?: 'auto' | 'landscape' | 'portrait';
  lock_condition?: string;
  restrictable?: boolean;
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
