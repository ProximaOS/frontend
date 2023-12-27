!(function () {
  'use strict';

  const { SerialPort } = require('serialport');
  const Readline = require('@serialport/parser-readline');

  const Telephony = {
    portName: '/dev/ttyUSB0',
    baudRate: 9600,
    serialPort: null,
    parser: null,
    isCallActive: false,

    init: function () {
      this.serialPort = new SerialPort(this.portName, { baudRate: this.baudRate });
      this.parser = this.serialPort.pipe(new Readline({ delimiter: '\r\n' }));

      this.serialPort.on('open', () => {
        console.log('Serial port opened.');
      });

      this.serialPort.on('error', (err) => {
        console.error('Serial port error:', err);
      });
    },

    call: function (number, callback) {
      this.serialPort.write(`ATD${number};\r\n`, (err) => {
        if (err) {
          console.error('Error making call:', err);
        } else {
          console.log(`Calling ${number}...`);
          this.isCallActive = true;
          this.startAudioStream(callback);
        }
      });
    },

    recieveCalls: function (callback) {
      this.parser.on('data', (data) => {
        // Check for incoming call indication in the received data
        if (data.includes('RING')) {
          console.log('Incoming call detected!');
          callback(data);
        }
      });
    },

    answerCall: function (callback) {
      this.serialPort.write('ATA\r\n', (err) => {
        if (err) {
          console.error('Error answering call:', err);
        } else {
          console.log('Call answered.');
          this.startAudioStream(callback);
          this.isCallActive = true;
        }
      });
    },

    startAudioStream: function (callback) {
      this.parser.on('data', (data) => {
        if (this.isCallActive) {
          // Process incoming voice data (assuming it's raw PCM audio)
          // You'll need to handle the data properly based on the format received
          // and feed it into the speaker for audio output
          callback(data);
        }
      });
    },

    hangUp: function () {
      this.serialPort.write('ATH\r\n', (err) => {
        if (err) {
          console.error('Error hanging up:', err);
        } else {
          console.log('Call hung up.');
          this.isCallActive = false;
        }
      });
    }
  };

  try {
    Telephony.init();
    module.exports = Telephony;
  } catch (error) {
    module.exports = {};
  }
})();
