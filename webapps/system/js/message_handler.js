!(function (exports) {
  'use strict';

  const MessageHandler = {
    init: function () {
      window.addEventListener('ipc-message', (event) => {
        const data = event.detail;
        switch (data.type) {
          case 'alert':
            this.handleAlert(data);
            break;

          case 'confirm':
            this.handleConfirm(data);
            break;

          case 'prompt':
            this.handlePrompt(data);
            break;

          case 'notification':
            this.handleNotification(data);
            break;

          case 'textselection':
            this.handleTextSelection(data);
            break;

          case 'keyboard':
            this.handleKeyboard(data);
            break;

          case 'launch':
            this.handleAppLaunch(data);
            break;

          case 'picture-in-picture':
            this.handlePictureInPicture(data);
            break;

          default:
            break;
        }
      });
    },

    handleAlert: function (data) {
      ModalDialog.showAlert(data.title || data.origin, data.text);
    },

    handleConfirm: function (data) {
      ModalDialog.showConfirm(data.title || data.origin, data.text);
    },

    handlePrompt: function (data) {
      ModalDialog.showPrompt(data.title || data.origin, data.text, data.input);
    },

    handleNotification: function (data) {
      const options = data.options;
      if (options.icon && !options.icon.startsWith('http')) {
        options.icon = `${data.origin}/${data.options.icon}`;
      }
      options.source = data.origin;
      NotificationToaster.showNotification(data.title, options);
    },

    handleTextSelection: function (data) {
      if (data.action === 'show') {
        TextSelection.show(data.selectedText, data.position.left, data.position.top);
      } else {
        TextSelection.hide();
      }
    },

    handleKeyboard: function (data) {
      clearTimeout(this.keyboardTimer);
      if (data.action === 'show') {
        Keyboard.show();
      } else {
        this.keyboardTimer = setTimeout(() => {
          Keyboard.hide();
        }, 500);
      }
    },

    handleAppLaunch: function (data) {
      AppWindow.create(data.manifestUrl, {
        originPos: {
          xPos: data.xPos,
          yPos: data.yPos,
          xScale: data.xScale,
          yScale: data.yScale
        }
      });
    },

    handlePictureInPicture: function (data) {
      if (data.action === 'enable') {
        PictureInPicture.show(data.videoUrl, data.timestamp);
      } else {
        PictureInPicture.hide();
      }
    }
  };

  MessageHandler.init();
})(window);
