const { ipcRenderer } = require('electron');
const api = require('./src/api');
const NotificationAPI = require('./src/apis/notification');
const ModalDialogs = require('./src/apis/modal_dialogs');

window.alert = ModalDialogs.alert;
window.confirm = ModalDialogs.confirm;
window.prompt = ModalDialogs.prompt;

window.Notification = NotificationAPI;

const pattern = /^http:\/\/.*\.localhost:8081\//;
if (!pattern.test(location.href)) {
  return;
}

if (location.host.includes('system.localhost')) {
  api.isWebview = false;
} else {
  api.isWebview = true;
}

window.navigator.api = api;
window.navigator.ipcRenderer = ipcRenderer;
