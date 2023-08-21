!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const powerButton = document.getElementById('simulator-power-button');
  const volumeUpButton = document.getElementById('simulator-volume-up-button');
  const volumeDownButton = document.getElementById('simulator-volume-down-button');
  const shortcutButton = document.getElementById('simulator-shortcut-button');
  const rotateLeftButton = document.getElementById('simulator-rotate-left-button');
  const rotateRightButton = document.getElementById('simulator-rotate-right-button');

  powerButton.addEventListener('pointerdown', () => {
    ipcRenderer.send('powerstart', {});
  });
  powerButton.addEventListener('pointerup', () => {
    ipcRenderer.send('powerend', {});
  });

  volumeUpButton.addEventListener('click', () => {
    ipcRenderer.send('volumeup', {});
  });
  volumeDownButton.addEventListener('click', () => {
    ipcRenderer.send('volumedown', {});
  });

  shortcutButton.addEventListener('click', () => {
    ipcRenderer.send('shortcut', {});
  });

  let rotationIndex = 0;
  const rotations = ['0deg', '90deg', '180deg', '-90deg'];
  rotateLeftButton.addEventListener('click', () => {
    rotationIndex = (rotationIndex - 1 + rotations.length) % rotations.length;
    ipcRenderer.send('rotate', { rotation: rotations[rotationIndex] });
  });
  rotateRightButton.addEventListener('click', () => {
    rotationIndex = (rotationIndex + 1) % rotations.length;
    ipcRenderer.send('rotate', { rotation: rotations[rotationIndex] });
  });
})(window);
