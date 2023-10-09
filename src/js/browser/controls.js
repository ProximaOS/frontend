!(function () {
  'use strict';

  const path = require('path');
  const { BrowserView } = require('electron');

  module.exports = function (mainWindow) {
    // Browser view renderer
    const webview = new BrowserView({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    const { width, height } = mainWindow.getContentBounds();
    webview.setBounds({ x: width - 50, y: 0, width: 50, height });
    mainWindow.addBrowserView(webview);

    webview.webContents.loadFile(
      path.join(__dirname, '..', '..', '..', 'internal', 'simulator', 'controls.html')
    );

    mainWindow.on('resized', () => {
      const { width, height } = mainWindow.getContentBounds();
      webview.setBounds({ x: width - 50, y: 0, width: 50, height });
    });
  };
})();
