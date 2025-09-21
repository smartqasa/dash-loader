declare const __BUILD_VERSION__: string;
declare const __BUILD_TIMESTAMP__: string;

declare module "*.css" {
  import { CSSResult } from "lit";
  const styles: CSSResult;
  export default styles;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare interface Window {
  browser_mod?: {
    refresh: () => void;
    service: (service: string, data?: object) => void;
  };
  customCards: Array<Object>;
  fully?: {
    bind: (event: string, action: string) => void;
    bringToBackground: () => void;
    bringToForeground: () => void;
    clearCache: () => void;
    getDeviceModel: () => string;
    isInForeground: () => boolean;
    reboot: () => void;
    restartApp: () => void;
    setStringSetting: (key: string, value: string) => void;
    startApplication: (packageName: string) => void;
    stopScreensaver: () => void;
    turnScreenOff: (keepAlive: boolean) => void;
    turnScreenOn: () => void;
  };

  smartqasa: {
    clearCache: () => void;
    chipsConfig: any;
    confirm: (data: any) => void;
    confirmClose: () => void;
    darkModeImage: string;
    deviceModel: string;
    lightModeImage: string;
    menuTab: number;
    popup: (data: any) => void;
    popupClose: () => void;
    popupReset: () => void;
    popupStack: any[];
    startArea: string | undefined;
    service: (service: string, data?: object) => void;
    videoSource: string;
  };
}
