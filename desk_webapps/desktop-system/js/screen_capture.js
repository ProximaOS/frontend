!(function (exports) {

'use strict';

const ScreenCapture = {
  mediaRecorder: null,
  chunks: [],
  isRecording: false,
  stream: null,

  timeIcon: document.getElementById("statusbar-time"),
  toggleButton: document.getElementById("quick-settings-screen-capture"),

  init: function () {
    this.toggleButton.addEventListener("click", () => {
      ScreenCapture.toggleCapture();
    });
  },

  startCapture: function () {
    this.isRecording = true;
    this.toggleButton.parentElement.classList.add("enabled");
    this.timeIcon.className = "indicator screen-capture";
  },

  stopCapture: function () {
    this.isRecording = false;
    this.toggleButton.parentElement.classList.remove("enabled");
    this.timeIcon.className = "";
  },

  toggleCapture: function () {
    if (this.isRecording) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  },
};

ScreenCapture.init();

})(window);
