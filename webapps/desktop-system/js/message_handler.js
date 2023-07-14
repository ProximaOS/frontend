const MessageHandler = {
  init: function () {
    navigator.ipcRenderer.on('message', (event, data) => {
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

        default:
          break;
      }
    });
  },

  handleNotification: function (data) {
    var options = data.options;
    options.icon = `${data.origin}/${data.options.icon}`;
    options.source = data.origin;
    NotificationToaster.showNotification(data.title, options);
  },

  handleAlert: function (data) {
    ModalDialog.showAlert(data.origin, data.text);
  },

  handleConfirm: function (data) {
    ModalDialog.showConfirm(data.origin, data.text);
  },

  handlePrompt: function (data) {
    ModalDialog.showPrompt(data.origin, data.text, data.input);
  }
}

MessageHandler.init();
