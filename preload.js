const { ipcRenderer } = require("electron");
const api = require("./src/api");
const NotificationAPI = require("./src/apis/notification");
const ModalDialogs = require("./src/apis/modal_dialogs");

window.open = function (url, options) {
  var optionsList = options.split(',');
  var formattedUrl;
  if (!url.startsWith('http:') || !url.startsWith('https:')) {
    if (url.startsWith('/')) {
      formattedUrl = location.origin + url;
    } else {
      formattedUrl = `${location.origin}/${url}`;
    }
  } else {
    formattedUrl = url;
  }

  ipcRenderer.send("message", {
    type: "window",
    action: "open",
    url: formattedUrl,
    options: optionsList
  });
};

window.alert = ModalDialogs.alert;
window.confirm = ModalDialogs.confirm;
window.prompt = ModalDialogs.prompt;

window.Notification = NotificationAPI;

window.addEventListener("load", function () {
  var inputAreas = document.querySelectorAll("input, textarea");
  inputAreas.forEach(function (inputElement) {
    inputElement.addEventListener("focus", function () {
      ipcRenderer.send("message", {
        type: "keyboard",
        action: "show",
      });
    });

    inputElement.addEventListener("blur", function () {
      ipcRenderer.send("message", {
        type: "keyboard",
        action: "hide",
      });
    });
  });
});

document.addEventListener("play", function () {
  var video = document.querySelectorAll("video");
  video.forEach(function (videoElement) {
    var existingButton = videoElement.parentElement.querySelector('.openorchid-pip-button');
    if (existingButton) {
      return;
    }

    var button = document.createElement("button");
    button.classList.add("openorchid-pip-button");
    button.dataset.enabled = false;
    button.addEventListener("click", function () {
      if (button.dataset.enabled) {
        ipcRenderer.send("message", {
          type: "picture-in-picture",
          action: "disable",
        });
      } else {
        ipcRenderer.send("message", {
          type: "picture-in-picture",
          action: "enable",
        });
      }
      button.dataset.enabled = !button.dataset.enabled;
    });
    videoElement.parentElement.appendChild(button);
  });
});

const pattern = /^http:\/\/.*\.localhost:8081\//;
if (!pattern.test(location.href)) {
  return;
}

if (location.host.includes("system.localhost")) {
  api.isWebview = false;
} else {
  api.isWebview = true;
}

window.navigator.api = api;
window.navigator.ipcRenderer = ipcRenderer;
window.process = process;
