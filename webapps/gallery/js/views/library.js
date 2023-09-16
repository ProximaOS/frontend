!(function (exports) {
  'use strict';

  const Library = {
    imagesContainer: document.getElementById('images-container'),

    PHOTOS_DIR: '/',
    PHOTOS_MIME: 'image',

    init: function () {
      FileIndexer(this.PHOTOS_DIR, this.PHOTOS_MIME).then((array) => {
        array.forEach((item) => {
          this.addImage(item);
        });
      });
    },

    setCategory: function (dateTime) {
      const date = new Date(dateTime);
      const dateId = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
      const langCode = navigator.mozL10n.language.code === 'ar' ? 'ar-SA' : navigator.mozL10n.language.code;

      const existingCategory = document.querySelector(`[data-date="${dateId}"]`);
      if (existingCategory) {
        return existingCategory.querySelector('.container');
      }

      const category = document.createElement('div');
      category.classList.add('category');
      category.dataset.date = dateId;
      this.imagesContainer.appendChild(category);

      const dateLabel = document.createElement('header');
      dateLabel.classList.add('date');
      dateLabel.textContent = date.toLocaleDateString(langCode, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      category.appendChild(dateLabel);

      const container = document.createElement('div');
      container.classList.add('container');
      category.appendChild(container);

      return container;
    },

    addImage: function (path) {
      window.SDCardManager
        .read(path, { encoding: 'base64' })
        .then((data) => {
          const item = document.createElement('div');
          item.classList.add('image');

          const image = document.createElement('img');
          const mime = window.SDCardManager.getMime(path);
          image.src = `data:${mime};base64,${data}`;
          item.appendChild(image);

          window.SDCardManager.getFileStats(path).then((stats) => {
            this.setCategory(stats.birthtime).appendChild(item);
          });
        });
    }
  };

  window.addEventListener('load', () => Library.init());
})(window);
