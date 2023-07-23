const { ipcRenderer } = require('electron');

const ScreenCapture = {
  elementId: 'screen',
  mediaRecorder: null,
  recordedChunks: [],
  isRecording: false,

  toggleButton: document.getElementById('quick-settings-screen-capture'),

  init: function () {
    this.toggleButton.addEventListener('click', () => {
      screenCapture.toggleCapture();
    });
  },

  startCapture: function () {
    const element = document.getElementById(this.elementId);
    const stream = element.captureStream();

    // Create a MediaRecorder instance
    this.mediaRecorder = new MediaRecorder(stream);

    // Event handler for recording data
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    // Event handler for recording stop
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const blobUrl = URL.createObjectURL(blob);

      // Send captured video URL to the main process via IPC
      ipcRenderer.send('captured-video', blobUrl);

      // Reset recordedChunks array
      this.recordedChunks = [];
    };

    // Start recording
    this.mediaRecorder.start();
    this.isRecording = true;
    console.log('Capture started');
  },

  stopCapture: function () {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Capture stopped');
    }
  },

  toggleCapture: function () {
    if (this.isRecording) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  }
};

ScreenCapture.init();
