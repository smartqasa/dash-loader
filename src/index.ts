window.customCards = window.customCards || [];

window.smartqasa = window.smartqasa || {
  confirm: () => {},
  confirmClose: () => {},
  deviceModel: '',
  lock_condition: '',
  menuTab: 0,
  popupStack: [],
  popup: () => {},
  popupClose: () => {},
  popupReset: () => {},
  service: () => {},
  startArea: location.pathname.split('/').pop(),
};

if (window.fully) {
  console.log('Device Model: ' + window.fully.getDeviceModel());
  window.smartqasa.deviceModel = window.fully.getDeviceModel();
}

import './panel';

window.smartqasa.versionLoader = __BUILD_VERSION__;

console.info(
  '%c SmartQasa Loader ⏏ ' + __BUILD_VERSION__ + ' ',
  'background-color: #0000ff; color: #ffffff; font-weight: 700;'
);
