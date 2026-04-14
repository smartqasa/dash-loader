window.customCards = window.customCards || [];

window.smartqasa = window.smartqasa || {
  confirm: () => {},
  confirmClose: () => {},
  deviceModel: '',
  enforceRestrictions: false,
  menuTab: 0,
  popupStack: [],
  popup: () => {},
  popupClose: () => {},
  popupReset: () => {},
  restrictions: {
    domains: [],
    home: false,
    areas: false,
    menu: false,
    restricted_modes: [],
    allow_admin_mode: false,
    allow_admin_users: false,
    allowed_users: [],
  },
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
