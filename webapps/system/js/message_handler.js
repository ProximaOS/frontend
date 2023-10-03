!(function (exports) {
  'use strict';

  const MessageHandler = {
    init: function () {
      window.addEventListener('ipc-message', this.handleIPCMessage.bind(this));
    },

    handleIPCMessage: function (event) {
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

        case 'title':
          this.handleTitleTooltip(data);
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

      const webviews = document.querySelectorAll('webview');
      webviews.forEach((webview) => {
        try {
          webview.send('message', data);
        } catch (error) {
          console.error(error);
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
        TextSelection.show(
          data.selectedText,
          data.position.left,
          data.position.top
        );
      } else {
        TextSelection.hide();
      }
    },

    handleTitleTooltip: function (data) {
      if (data.action === 'show') {
        TitleTooltip.show(
          data.title,
          data.position.left,
          data.position.top,
          data.originType
        );
      } else {
        TitleTooltip.hide();
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
        animVariables: {
          xPos: data.xPos,
          yPos: data.yPos,
          xScale: data.xScale,
          yScale: data.yScale,
          iconXPos: data.iconXPos,
          iconYPos: data.iconYPos,
          iconXScale: data.iconXScale,
          iconYScale: data.iconYScale
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
