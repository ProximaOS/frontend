const fs = require('fs');
const path = require('path');

const gallery = document.getElementById('gallery');

const mediaPath = './profile';

// Recursive function to read files and directories
function readMediaFiles(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading media files:', err);
      return;
    }

    // Categorize media files by date
    const mediaData = {};

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        readMediaFiles(filePath); // Recursively call readMediaFiles for subdirectories
      } else {
        const fileDate = fileStat.mtime.toDateString();

        if (!mediaData[fileDate]) {
          mediaData[fileDate] = [];
        }

        mediaData[fileDate].push({
          name: file,
          path: filePath,
          isVideo: isVideoFile(file)
        });
      }
    });

    // Loop through the media data and create grid items
    for (const date in mediaData) {
      const dateContainer = document.createElement('div');
      dateContainer.classList.add('section');
      gallery.appendChild(dateContainer);

      const header = document.createElement('header');
      header.textContent = date;
      dateContainer.appendChild(header);

      const imageContainer = document.createElement('div');
      imageContainer.classList.add('images');
      dateContainer.appendChild(imageContainer);

      const mediaItems = mediaData[date];

      mediaItems.forEach((media) => {
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('grid-item');

        if (media.isVideo) {
          itemContainer.innerHTML = `<video src="file:///./${media.path.replaceAll('\\', '/')}" width="100%" height="100%"></video>`;
        } else {
          itemContainer.innerHTML = `<img lazyload="true" src="file:///./${media.path.replaceAll('\\', '/')}" width="100%" height="100%">`;
        }

        imageContainer.appendChild(itemContainer);
      });
    }
  });
}

// Start reading media files from the mediaPath directory
readMediaFiles(mediaPath);

// Check if a file is a video file
function isVideoFile(file) {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
  const ext = path.extname(file).toLowerCase();
  return videoExtensions.includes(ext);
}
