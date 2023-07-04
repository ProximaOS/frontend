const { app, protocol } = require('electron');
const path = require('path');
const chrome = require('./modules/chrome');
const openOrchidUi = require('./modules/openorchid_ui');

app.whenReady().then(() => {
  protocol.registerFileProtocol('openorchid', (request, callback) => {
    const url = request.url.substr(8); // Remove the protocol part ('openorchid://')
    const filePath = path.join(__dirname, 'myDirectory', url);

    callback({ path: filePath });
  });

  if (process.argv.indexOf('--chrome') !== -1) {
    chrome();
  } else {
    openOrchidUi();
  }
});
