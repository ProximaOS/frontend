const { ipcRenderer } = require('electron');

document.addEventListener('focus', event => {
  if (event.target.nodeName === 'INPUT') {
    window.parent.postMessage({ type: 'focus', element: event.target.id, isFocused: true }, '*');
  }
}, true);

document.addEventListener('blur', event => {
  if (event.target.nodeName === 'INPUT') {
    window.parent.postMessage({ type: 'focus', element: event.target.id, isFocused: false }, '*');
  }
}, true);

// Override the Notification constructor
window.Notification = class Notification {
  constructor(title, options) {
    // Forward the notification data to the parent renderer process
    ipcRenderer.sendToHost('notification', {
      data: {
        title,
        options
      }
    });
  }
};
