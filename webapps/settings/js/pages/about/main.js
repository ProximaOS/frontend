!(function (exports) {
  'use strict';

  const About = {
    logo: document.getElementById('aboutInfo-logo'),
    hostname: document.getElementById('aboutInfo-hostname'),
    systemName: document.getElementById('aboutInfo-systemName'),
    systemVersion: document.getElementById('aboutInfo-systemVersion'),
    hardwareId: document.getElementById('aboutInfo-hardwareId'),
    arch: document.getElementById('aboutInfo-arch'),
    endianness: document.getElementById('aboutInfo-endianness'),
    type: document.getElementById('aboutInfo-type'),

    EASTER_EGG_MANIFEST_URL: `http://easteregg.localhost:8081/manifest.json`,

    init: function () {
      this.logo.addEventListener('dblclick', this.onDoubleClick.bind(this));

      this.hostname.textContent = DeviceInformation.getHostname();
      this.systemName.textContent = navigator.mozL10n.get('brandShortName');
      this.systemVersion.textContent = Environment.version;
      this.hardwareId.textContent = DeviceInformation.getHardwareId();
      this.arch.textContent = DeviceInformation.getArch();
      this.endianness.textContent = DeviceInformation.getEndianness();
      this.type.textContent = DeviceInformation.getType();
    },

    onDoubleClick: function (event) {
      this.logo.classList.add('activate');
      this.logo.addEventListener('animationend', () => {
        this.logo.classList.remove('activate');
        IPC.send('message', {
          type: 'launch',
          manifestUrl: this.EASTER_EGG_MANIFEST_URL
        })
      });
    }
  };

  About.init();
})(window);
