window.customCards = window.customCards || [];

window.smartqasa = window.smartqasa || {
  chipsConfig: {},
  confirm: () => {},
  confirmClose: () => {},
  deviceModel: "",
  menuTab: 0,
  popupStack: [],
  popup: () => {},
  popupClose: () => {},
  popupReset: () => {},
  service: () => {},
  startArea: location.pathname.split("/").pop(),
};

if (window.fully) {
  console.log("Device Model: " + window.fully.getDeviceModel());
  window.smartqasa.deviceModel = window.fully.getDeviceModel();
}

import "./panel";
import "./screensaver";

console.info(
  `%c SmartQasa Loader ⏏ ${__BUILD_VERSION__} (Built: ${__BUILD_TIMESTAMP__}) `,
  "background-color: #0000ff; color: #ffffff; font-weight: 700;"
);
