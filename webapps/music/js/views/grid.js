!(function (exports) {
  'use strict';

  const Grid = {
    gridContainer: document.getElementById('grid-container'),

    MUSIC_DIR: '/',
    MUSIC_MIME: 'audio',

    init: function () {
      FileIndexer(this.MUSIC_DIR, this.MUSIC_MIME).then((array) => {
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

    base64ToBlob: function (base64String, contentType) {
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      return new Blob([byteArray], { type: contentType });
    },

    addAudio: function (path) {
      SDCardManager.read(path).then((data) => {
        const mime = SDCardManager.getMime(path);
        const blob = new Blob([data], { type: mime });
        const parts = path.split('/');
        const fileName = parts[parts.length - 1];

        const item = document.createElement('div');
        item.addEventListener('click', () => {
          const blobURL = URL.createObjectURL(blob);
          Player.play(blobURL);
        });
        item.classList.add('music');

        const artwork = document.createElement('img');
        artwork.src = '';
        artwork.onerror = () => {
          artwork.src = '/images/default_keyart.png';
        };
        item.appendChild(artwork);

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

        jsmediatags.read(blob, {
          onSuccess: function (tag) {
            console.log(tag);

            if (tag.picture) {
              const data = tag.tags.picture.data;
              const format = tag.tags.picture.format;
              let base64String = '';
              for (let i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
              }
              const artworkUrl = `data:${format};base64,${base64String.toString('base64')}`;
              artwork.src = artworkUrl;
            }

            title.textContent = tag.tags.title;
            artist.textContent = tag.tags.artist;
          },
          onError: function (error) {
            console.log(error);
          }
        });

        this.setCategory('Unknown Artist').appendChild(item);
      });
    }
  };

  window.addEventListener('load', () => Grid.init());
})(window);
