const EventListener = {
  init: function () {
    window.addEventListener('message', this.onMessage);
    window.addEventListener('notification', this.onNotification);
  },

  onMessage: function (event) {
    // Check the message type
    if (event.data.type === 'focus') {
      // Process the focus event message
      const { elementNode, isFocused } = event.data;

      // Perform actions based on the focus event
      if (isFocused) {
        console.log(`Element with ID '${elementNode}' is focused`);
        Keyboard.show();
      } else {
        console.log(`Element with ID '${elementNode}' is blurred`);
        Keyboard.hide();
      }
    }
  },

  appWindow: function (event) {
    switch (event.channel) {
      case 'open-app':
        EventListener.onAppOpen(event);
        break;

      case 'notification':
        EventListener.onNotification(event);
        break;

      default:
        break;
    }
  },

  onAppOpen: function (event) {
    const { data } = event.args[0];
    AppWindow.create(data.manifestUrl, { originPos: { x: data.xOrigin, y: data.yOrigin } });
  },

  onNotification: function (event) {
    if (event.data.channel === 'notification') {
      const { data } = event.args[0];
      NotificationToaster.showNotification(data.title, data.config);
    }
  }
}

EventListener.init();
