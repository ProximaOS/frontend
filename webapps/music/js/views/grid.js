!(function (exports) {
  'use strict';

  const Grid = {
    gridContainer: document.getElementById('grid-container'),

    MUSIC_DIR: '/',
    MUSIC_MIME: 'audio',

    init: function () {
      FileIndexer(this.MUSIC_DIR, this.MUSIC_MIME).then((array) => {
        console.log(array);
        array.forEach((item) => {
          this.addAudio(item);
        });
      });
    },

    setCategory: function (artist) {
      const existingCategory = document.querySelector(
        `[data-artist="${artist}"]`
      );
      if (existingCategory) {
        return existingCategory.querySelector('.container');
      }

      const category = document.createElement('div');
      category.classList.add('category');
      category.dataset.artist = artist;
      this.gridContainer.appendChild(category);

      const artistLabel = document.createElement('header');
      artistLabel.classList.add('artist');
      artistLabel.textContent = artist;
      category.appendChild(artistLabel);

      const container = document.createElement('div');
      container.classList.add('container');
      category.appendChild(container);

      return container;
    },

    addAudio: function (path) {
      window.StorageManager.read(path, { encoding: 'base64' }).then((data) => {
        const parts = path.split('/');
        const fileName = parts[parts.length - 1];

        const item = document.createElement('div');
        item.classList.add('music');

        const keyart = document.createElement('img');
        keyart.src = '';
        keyart.onerror = () => {
          keyart.src = '/images/default_keyart.png';
        };
        item.appendChild(keyart);

        const textHolder = document.createElement('div');
        textHolder.classList.add('text-holder');
        item.appendChild(textHolder);

        const title = document.createElement('p');
        title.textContent = fileName;
        title.classList.add('title');
        textHolder.appendChild(title);

        const artist = document.createElement('p');
        artist.textContent = 'Unknown Artist';
        artist.classList.add('artist');
        textHolder.appendChild(artist);

        this.setCategory('Unknown Artist').appendChild(item);
      });
    }
  };

  window.addEventListener('load', () => Grid.init());
})(window);
