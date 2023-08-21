!(function (exports) {

'use strict';

const gallery = document.getElementById('gallery');

const mediaPath = '/';

// Recursive function to read files and directories
function readMediaFiles(directory) {
  _session.storageManager.read(directory).then(async (files) => {
    // Categorize media files by date
    const mediaData = {};

    if (await _session.storageManager.getMime(`${directory}/${file}`)) {
      return;
    }

    files.forEach(async (file) => {
      const filePath = `${directory}/${file}`;
      const fileStat = await _session.storageManager.getStats(filePath);

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
        itemContainer.innerHTML = `<img lazyload="true" src="file:///./${media.path.replaceAll('\\', '/')}" width="100%" height="100%">`;
        imageContainer.appendChild(itemContainer);
      });
    }
  });
}

// Start reading media files from the mediaPath directory
readMediaFiles(mediaPath);

})(window);
