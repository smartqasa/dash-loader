window.customCards = window.customCards || [];

window.smartqasa = window.smartqasa || {
  chipsConfig: [],
  confirm: () => {},
  confirmClose: () => {},
  deviceModel: '',
  kioskView: true,
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
  `%c SmartQasa Loader ⏏ ${__BUILD_VERSION__} (Built: ${__BUILD_TIMESTAMP__}) `,
  'background-color: #0000ff; color: #ffffff; font-weight: 700;'
);

// Dynamically load dash-elements with version-based cache busting
/*
function loadElements(): void {
  const version = '6.1.80b';

  const script = document.createElement('script');
  script.type = 'module';
  script.src = `/local/smartqasa/dash-elements/elements.js?v=${version}`;
  script.onerror = () => {
    console.error('[Loader] Failed to load dash-elements');
  };

  document.head.appendChild(script);
}

loadElements();
*/
