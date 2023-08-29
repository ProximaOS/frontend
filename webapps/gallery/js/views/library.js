!(function (exports) {
  'use strict';

  const Library = {
    imagesContainer: document.getElementById('images-container'),

    PHOTOS_DIR: '/photos',

    init: function () {
      this.indexFolder(this.PHOTOS_DIR);
    },

    indexFolder: function (path) {
      _session.storageManager.list(path).then((data) => {
        data.forEach(item => {
          _session.storageManager.getFileStats(`${path}/${item}`).then((stats) => {
            if (stats.isDirectory()) {
              this.indexFolder(`${path}/${item}`);
            } else {
              _session.storageManager.getMime(`${path}/${item}`).then((mime) => {
                if (mime.startsWith('image/')) {
                  this.addImage(`${path}/${item}`);
                }
              });
            }
          });
        });
      });
    },

    addImage: function (path) {
      const item = document.createElement('div');
      item.classList.add('image');
      this.imagesContainer.appendChild(item);

      _session.storageManager.read(path).then(function (data) {
        const image = document.createElement('img');
        image.src = data;
        item.appendChild(image);
      }, { encoding: 'base64' });
    }
  };

  document.addEventListener('DOMContentLoaded', () =>
    Library.init()
  );
})(window);
