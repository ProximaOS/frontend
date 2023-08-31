const path = require('path');

!(function () {
  'use strict';

  const { BrowserWindow } = require('electron');
  const electronLocalshortcut = require('electron-localshortcut');
  const isDev = require('electron-is-dev');

  module.exports = function (mainWindow) {
    let isSimulatingMobile = false;
    if (process.argv.indexOf('mobile-frame') !== -1) {
      isSimulatingMobile = true;
    }

    const controlsWindow = new BrowserWindow({
      width: 70,
      minWidth: 70,
      maxWidth: 70,
      height: mainWindow.getSize()[1],
      frame: false,
      fullscreenable: false,
      transparent: true,
      skipTaskbar: true,
      focusable: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    controlsWindow.loadFile(
      path.join(__dirname, '..', '..', 'internal', 'simulator', 'controls.html')
    );

    let frameWindow = null;
    if (isSimulatingMobile) {
      frameWindow = new BrowserWindow({
        icon: path.join(__dirname, '..', '..', 'internal', 'branding', 'icon.png'),
        title: 'OpenOrchid Simulator Frame',
        width: 426,
        height: 745,
        frame: false,
        fullscreenable: false,
        transparent: true,
        skipTaskbar: true,
        focusable: false,
        resizable: false
      });

      frameWindow.loadFile(
        path.join(__dirname, '..', '..', 'internal', 'simulator', 'frame.html')
      );
      frameWindow.setIgnoreMouseEvents(true);
    }

    let currentSize = mainWindow.getSize();
    let newPosition = mainWindow.getPosition();

    controlsWindow.setPosition(
      currentSize[0] + newPosition[0] + (isSimulatingMobile ? 32 : 0),
      newPosition[1],
      false
    );

    // Calculate the center position for the frameWindow
    const centerX = parseInt(newPosition[0] - (426 - mainWindow.getSize()[0]) / 2);
    const centerY = parseInt(newPosition[1] - (745 - mainWindow.getSize()[1]) / 2 + 24);

    if (frameWindow) {
      // Set the position of the frameWindow at the calculated center
      frameWindow.setPosition(centerX, centerY, false);
    }

    mainWindow.on('moved', () => {
      currentSize = mainWindow.getSize();
      newPosition = mainWindow.getPosition();
      controlsWindow.setPosition(
        currentSize[0] + newPosition[0] + (isSimulatingMobile ? 32 : 0),
        newPosition[1],
        false
      );
      if (frameWindow) {
        // Set the position of the frameWindow at the calculated center
        frameWindow.setPosition(centerX, centerY, false);
      }
    });

    let newSize = mainWindow.getSize();
    controlsWindow.setSize(70, newSize[1], false);
    mainWindow.on('resized', () => {
      newSize = mainWindow.getSize();
      newPosition = mainWindow.getPosition();
      controlsWindow.setSize(70, newSize[1], false);
      controlsWindow.setPosition(
        newSize[0] + newPosition[0],
        newPosition[1],
        false
      );
    });

    mainWindow.on('focus', () => {
      if (controlsWindow) {
        controlsWindow.show();
        controlsWindow.setAlwaysOnTop(true);
      }

      if (frameWindow) {
        frameWindow.show();
        frameWindow.setAlwaysOnTop(true);
      }
    });

    mainWindow.on('blur', () => {
      if (controlsWindow) {
        controlsWindow.hide();
        controlsWindow.setAlwaysOnTop(false);
      }

      if (frameWindow) {
        frameWindow.hide();
        frameWindow.setAlwaysOnTop(false);
      }
    });

    mainWindow.on('restore', () => {
      if (controlsWindow) {
        controlsWindow.show();
        controlsWindow.setAlwaysOnTop(true);
      }

      if (frameWindow) {
        frameWindow.show();
        frameWindow.setAlwaysOnTop(true);
      }
    });

    mainWindow.on('minimize', () => {
      if (controlsWindow) {
        controlsWindow.hide();
        controlsWindow.setAlwaysOnTop(false);
      }

      if (frameWindow) {
        frameWindow.hide();
        frameWindow.setAlwaysOnTop(false);
      }
    });

    mainWindow.on('closed', () => {
      if (controlsWindow) {
        controlsWindow.close();
      }

      if (frameWindow) {
        frameWindow.close();
      }
    });

    electronLocalshortcut.register(controlsWindow, ['Ctrl+R', 'F5'], () => {
      controlsWindow.reload();
    });
    electronLocalshortcut.register(controlsWindow, ['Ctrl+I', 'F12'], () => {
      controlsWindow.openDevTools();
    });
  };
})();
