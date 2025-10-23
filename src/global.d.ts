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

declare module "*.mp3" {
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
    getInternalAppSpecificStoragePath: () => string;
    getAndroidVersion: () => string;
    getAudioVolume: (stream: number) => number;
    getBatteryLevel: () => number;
    getDeviceModel: () => string;
    getDeviceName: () => string;
    getIp4Address: () => string;
    getScreenBrightness: () => number;
    getWifiSsid: () => string;
    isInForeground: () => boolean;
    isPluggedIn: () => boolean;
    isNetworkConnected: () => boolean;
    playSound: (url: string, loop: boolean, stream: number) => void;
    readFile: (path: string) => string;
    reboot: () => void;
    restartApp: () => void;
    setAudioVolume: (level: number, stream: number) => void;
    setScreenBrightness: (level: number) => void;
    setStringSetting: (key: string, value: string) => void;
    startApplication: (packageName: string) => void;
    stopScreensaver: () => void;
    turnScreenOff: (keepAlive: boolean) => void;
    turnScreenOn: () => void;

    writeFile: (path: string, content: string) => void;
  };

  smartqasa: {
    chipsConfig: any;
    confirm: (data: any) => void;
    confirmClose: () => void;
    deviceModel: string;
    menuTab: number;
    popup: (data: any) => void;
    popupClose: () => void;
    popupReset: () => void;
    popupStack: any[];
    startArea: string | undefined;
    service: (service: string, data?: object) => void;
  };
}
