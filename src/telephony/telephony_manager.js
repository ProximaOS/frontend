!(function () {

'use strict';

module.exports = {
  isCalling: false,
  isRinging: false,
  callLogs: [],
  smsData: [],

  call: function(number) {
    this.isCalling = true;
    this.callLogs.push({
      number: number,
      signal: 'out'
    });
  },

  hangUp: function(number) {
    this.isCalling = false;
    this.callLogs.push({
      number: number,
      signal: 'in'
    });
  },

  sendMessage: function(number, text) {
    this.smsData.push({
      number: number,
      message: text
    });
  },
};

})();
