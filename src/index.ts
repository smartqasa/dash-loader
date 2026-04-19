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

const fontId = 'sq-font-great-vibes';

if (!document.getElementById(fontId)) {
  const link = document.createElement('link');
  link.id = fontId;
  link.href =
    'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

if (window.fully) {
  const deviceModel = window.fully.getDeviceModel();
  console.log('Device Model: ' + deviceModel);
  window.smartqasa.deviceModel = deviceModel;
}

import './panel';

window.smartqasa.versionLoader = __BUILD_VERSION__;

console.info(
  '%c SmartQasa Loader ⏏ ' + __BUILD_VERSION__ + ' ',
  'background-color: #0000ff; color: #ffffff; font-weight: 700;'
);
