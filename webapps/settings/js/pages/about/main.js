!(function (exports) {
  'use strict';

  const About = {
    hostname: document.getElementById('aboutInfo-hostname'),
    systemName: document.getElementById('aboutInfo-systemName'),
    systemVersion: document.getElementById('aboutInfo-systemVersion'),
    hardwareId: document.getElementById('aboutInfo-hardwareId'),
    arch: document.getElementById('aboutInfo-arch'),
    endianness: document.getElementById('aboutInfo-endianness'),
    type: document.getElementById('aboutInfo-type'),

    init: function () {
      this.hostname.textContent = DeviceInformation.getHostname();
      this.systemName.textContent = DeviceInformation.getSystemName();
      this.systemVersion.textContent = DeviceInformation.getSystemVersion();
      this.hardwareId.textContent = DeviceInformation.getHardwareId();
      this.arch.textContent = DeviceInformation.getArch();
      this.endianness.textContent = DeviceInformation.getEndianness();
      this.type.textContent = DeviceInformation.getType();
    }
  };

  About.init();
})(window);
