!(function () {
  'use strict';

  const SerialPort = require('serialport');
  const Readline = require('@serialport/parser-readline');

  const SmsManager = {
    portName: '/dev/ttyUSB0',
    baudRate: 9600,
    serialPort: null,
    parser: null,

    init: function () {
      this.serialPort = new SerialPort(this.portName, { baudRate: this.baudRate });
      this.parser = this.serialPort.pipe(new Readline({ delimiter: '\r\n' }));

      this.serialPort.on('open', () => {
        console.log('Serial port opened.');
        // Send initialization AT commands if required
        // Example: this.serialPort.write('AT\r\n', (err) => {...});
      });

      this.serialPort.on('error', (err) => {
        console.error('Serial port error:', err);
      });
    },

    sendSMS: function (phoneNumber, message) {
      if (!this.serialPort || !this.serialPort.isOpen) {
        console.error('Serial port not initialized or not open');
        return;
      }

      const smsCommand = `AT+CMGS="${phoneNumber}"`;
      const smsData = `${message}${String.fromCharCode(26)}`; // Ctrl-Z indicates end of message

      this.serialPort.write(`${smsCommand}\r\n`, (err) => {
        if (err) {
          console.error('Error sending SMS command:', err);
        } else {
          console.log(`Sending SMS to ${phoneNumber}: ${message}`);
          this.serialPort.write(smsData, (err) => {
            if (err) {
              console.error('Error sending SMS data:', err);
            }
          });
        }
      });
    },

    receiveSMS: function (callback) {
      this.parser.on('data', (data) => {
        console.log('Received:', data);
        callback(data);
      });
    }
  };

  try {
    SmsManager.init();
    module.exports = SmsManager;
  } catch (error) {
    module.exports = {};
  }
})();
