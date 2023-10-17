!(function () {
  'use strict';

  const os = require('os');
  const crypto = require('crypto');

  module.exports = {
    getHardwareId: function () {
      const cpus = os.cpus();
      const arch = os.machine();
      const endianness = os.endianness();
      const totalMemory = os.totalmem();
      const release = os.release();
      const version = os.version();

      const hardwareInfo = `${cpus.length}-${arch}-${endianness}-${totalMemory}-${release}-${version}`;

      const sha256 = crypto.createHash('sha256');
      sha256.update(hardwareInfo);
      const uniqueHash = sha256.digest('hex');

      return uniqueHash;
    },

    getSystemName: function () {
      return os.version();
    },

    getSystemVersion: function () {
      return os.release();
    },

    getEndianness: function () {
      return os.endianness();
    },

    getArch: function () {
      return os.machine();
    },

    getPlatform: function () {
      return os.platform();
    },

    getHostname: function () {
      return os.hostname();
    },

    getCpus: function () {
      return os.cpus();
    },

    getFreeMemory: function () {
      return os.freemem();
    },

    getTotalMemory: function () {
      return os.totalmem();
    },

    getUptime: function () {
      return os.uptime();
    },

    getNetworkInterfaces: function () {
      return os.networkInterfaces();
    },

    getType: function () {
      return os.type();
    },

    getUserInfo: function () {
      return os.userInfo();
    },

    getHomeDir: function () {
      return os.homedir();
    },

    getTempDir: function () {
      return os.tmpdir();
    }
  };
})();
