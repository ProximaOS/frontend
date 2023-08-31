!(function (exports) {
  'use strict';

  const fs = require('fs');
  const path = require('path');

  const Viewfinder = {
    viewfinder: document.getElementById('viewfinder'),
    shutterButton: document.getElementById('shutter-button'),
    galleryButton: document.getElementById('gallery-button'),
    recordButton: document.getElementById('record-button'),
    mediaStream: null,
    isRecording: false,
    recordChunks: [],

    init: function () {
      // Check if the browser supports the getUserMedia API
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Access the camera
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            // Set the video source to the camera stream
            this.viewfinder.srcObject = stream;
            this.mediaStream = stream;
          })
          .catch((error) => {
            console.error('Error accessing the camera.', error);
          });
      } else {
        console.error('getUserMedia API is not supported in this browser.');
      }

      // Add click event listener to the shutter button
      this.shutterButton.addEventListener('click', () => {
        this.captureImage();
      });

      // Add click event listener to the record button
      this.recordButton.addEventListener('click', () => {
        this.toggleRecording();
      });

      // Show the last captured image on initialization
      this.showLastImage();
    },

    captureImage: function () {
      // Create a new HTMLCanvasElement to draw the image from the viewfinder
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = this.viewfinder.videoWidth;
      canvas.height = this.viewfinder.videoHeight;

      // Draw the current frame from the viewfinder onto the canvas
      context.drawImage(this.viewfinder, 0, 0, canvas.width, canvas.height);

      // Convert the canvas image to a Data URL
      const imageUrl = canvas.toDataURL('image/jpeg');

      // Create a new image element to display the captured image
      const imageElement = document.createElement('img');
      imageElement.src = imageUrl;

      // Clear the previous image from the gallery button
      this.galleryButton.innerHTML = '';

      // Append the captured image to the gallery button
      this.galleryButton.appendChild(imageElement);

      // Save the captured image using the fs module
      this.saveCapturedImage(imageUrl);
    },

    toggleRecording: function () {
      if (!this.isRecording) {
        // Start recording
        this.recordChunks = [];
        this.mediaStream
          .getVideoTracks()[0]
          .addEventListener('dataavailable', this.handleRecordData);
        this.recordButton.classList.add('enabled');
        this.isRecording = true;
      } else {
        // Stop recording
        this.mediaStream
          .getVideoTracks()[0]
          .removeEventListener('dataavailable', this.handleRecordData);
        this.recordButton.classList.remove('enabled');
        this.isRecording = false;
        this.saveRecordedVideo();
      }
    },

    handleRecordData: function (event) {
      if (event.data.size > 0) {
        this.recordChunks.push(event.data);
      }
    },

    saveCapturedImage: function (imageUrl) {
      // Convert the Data URL to a Buffer
      const imageData = Buffer.from(imageUrl.split(',')[1], 'base64');

      // Create the folder if it doesn't exist
      const folderPath = './profile/DCIM/MEDIA100';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Save the image using the fs module
      const fileName = path.join(folderPath, `photo_${Date.now()}.jpg`);
      fs.writeFile(fileName, imageData, (err) => {
        if (err) {
          console.error('Error saving the image.', err);
        } else {
          console.log('Image saved:', fileName);

          // Store the file name in local storage
          localStorage.setItem('lastImage', imageData);
        }
      });
    },

    saveRecordedVideo: function () {
      // Create a new Blob from the recorded chunks
      const videoBlob = new Blob(this.recordChunks, { type: 'video/webm' });

      // Create the folder if it doesn't exist
      const folderPath = './profile/DCIM/MEDIA100';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Save the video using the fs module
      const fileName = path.join(folderPath, `video_${Date.now()}.webm`);
      fs.writeFile(fileName, videoBlob, (err) => {
        if (err) {
          console.error('Error saving the video.', err);
        } else {
          console.log('Video saved:', fileName);
        }
      });
    },

    showLastImage: function () {
      // Retrieve the file name from local storage
      const lastImage = localStorage.getItem('lastImage');

      if (lastImage) {
        // Create an image element for the last captured image
        const imageElement = document.createElement('img');
        imageElement.src = lastImage;

        // Clear the previous image from the gallery button
        this.galleryButton.innerHTML = '';

        // Append the last captured image to the gallery button
        this.galleryButton.appendChild(imageElement);
      }
    }
  };

  Viewfinder.init();
})(window);
