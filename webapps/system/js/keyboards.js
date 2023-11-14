!(function (exports) {
  'use strict';

  const Keyboard = {
    _id: 0,

    screen: document.getElementById('screen'),
    keyboardContainer: document.getElementById('keyboards'),

    DEFAULT_KEYBOARD: `http://keyboard.localhost:${location.port}/manifest.json`,

    init: function () {
      this.create(this.DEFAULT_KEYBOARD);
    },

    show: function () {
      this.screen.classList.add('keyboard-visible');
      this.keyboardContainer.classList.add('visible');
    },

    hide: function () {
      this.screen.classList.remove('keyboard-visible');
      this.keyboardContainer.classList.remove('visible');
    },

    toggle: function () {
      this.screen.classList.toggle('keyboard-visible');
      this.keyboardContainer.classList.toggle('visible');
    },

    create: async function (manifestUrl) {
      const windowId = `inputframe${Keyboard._id}`;
      const webviewId = `inputbrowser${Keyboard._id}`;
      Keyboard._id++;

      let manifest;
      await fetch(manifestUrl)
        .then((response) => response.json())
        .then(function (data) {
          manifest = data;
          // You can perform further operations with the 'manifest' variable here
        })
        .catch(function (error) {
          console.error('Error fetching manifest:', error);
        });

      const keyboard = document.createElement('div');
      keyboard.id = windowId;
      keyboard.classList.add('inputframe');
      this.keyboardContainer.appendChild(keyboard);

      const browser = document.createElement('webview');
      browser.id = webviewId;
      browser.classList.add('browser');
      const url = new URL(manifestUrl);
      setTimeout(() => {
        browser.src = url.origin + manifest.launch_path;
      }, 300);
      keyboard.appendChild(browser);
    }
  };

  Keyboard.init();

  exports.Keyboard = Keyboard;
})(window);
