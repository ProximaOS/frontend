!(function (exports) {
  'use strict';

  const Keyboards = {
    suggestions: document.getElementById('suggestions'),
    keys: null,
    toolbar: document.getElementById('toolbar'),

    currentLanguage: 'en',

    keySound: new Audio('/resources/sounds/key.wav'),
    keySpecialSound: new Audio('/resources/sounds/special.wav'),

    init: function () {
      this.keys = document.getElementById('keys');

      this.createLayoutKeyset({
        isCapsLock: false
      });
    },

    createLayoutKeyset: function ({ isCapsLock = false, targetPage = 0 }) {
      const data = Keyboards[this.currentLanguage];
      let keys = data.keys;
      if (data.pages && data.pages[targetPage]) {
        keys = data.pages[targetPage].keys;
      }

      const symbolsButton = {
        value: targetPage === 0 ? '?123' : data.shortLabel,
        keyCode: KeyEvent.DOM_VK_ALT,
        targetPage: targetPage === 0 ? 1 : 0,
        ratio: 2,
        className: 'special'
      };

      const quickSymbolButton = {
        value: '.',
        className: 'alternate-indicator'
      };

      this.keys.innerHTML = '';

      keys.forEach((row, index) => {
        const keyRow = document.createElement('div');
        keyRow.classList.add('keyboard-row');
        this.keys.appendChild(keyRow);

        if (index === keys.length - 1) {
          row = [symbolsButton, quickSymbolButton, ...row];
        }

        row.forEach((key) => {
          const keyButton = document.createElement('button');
          keyButton.classList.add('key');
          if (key.className) {
            keyButton.classList.add(key.className);
          }
          keyRow.appendChild(keyButton);

          const displayValue = key.value;
          switch (displayValue) {
            case '⇪':
              keyButton.classList.add('special');
              keyButton.classList.add('shift');
              if (isCapsLock) {
                keyButton.classList.add('active');
              }
              break;

            case '⌫':
              keyButton.classList.add('special');
              keyButton.classList.add('backspace');
              break;

            case '↵':
              keyButton.classList.add('return');
              break;

            default:
              break;
          }

          if (isCapsLock) {
            keyButton.innerHTML = displayValue.startsWith('&')
              ? displayValue
              : displayValue.toUpperCase();
          } else {
            keyButton.innerHTML = displayValue;
          }
          if (key.ratio) {
            keyButton.style.flex = key.ratio;
          }

          keyButton.addEventListener('pointerdown', () => {
            if (
              (key.keyCode === KeyEvent.DOM_VK_CAPS_LOCKkey.keyCode) ===
                KeyEvent.DOM_VK_ALT ||
              key.keyCode === KeyEvent.DOM_VK_BACK_SPACE ||
              key.keyCode === KeyEvent.DOM_VK_RETURN
            ) {
              this.keySpecialSound.currentTime = 0;
              this.keySpecialSound.play();
            } else {
              this.keySound.currentTime = 0;
              this.keySound.play();
            }
          });

          keyButton.addEventListener('pointerup', () => {
            if (key.keyCode === KeyEvent.DOM_VK_CAPS_LOCK) {
              this.createLayoutKeyset({
                isCapsLock: !isCapsLock
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_ALT) {
              this.createLayoutKeyset({
                targetPage: key.targetPage
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
              IPC.send('input', {
                type: 'keyDown',
                keyCode: 'Backspace'
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_RETURN) {
              IPC.send('input', {
                type: 'keyDown',
                keyCode: 'Enter'
              });
            } else {
              const keyCode = key.keyCode || key.value.charCodeAt();
              IPC.send('input', {
                type: 'char',
                keyCode
              });
            }
          });
        });
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Keyboards.init();
  });

  exports.Keyboards = Keyboards;
})(window);
