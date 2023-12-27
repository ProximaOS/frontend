!(function (exports) {
  'use strict';

  const Library = {
    imagesContainer: document.getElementById('images-container'),

    PHOTOS_DIR: '/',
    PHOTOS_MIME: 'image',

    init: function () {
      FileIndexer(this.PHOTOS_DIR, this.PHOTOS_MIME).then((array) => {
        this.images = array;
        array.forEach((item, index) => {
          this.addImage(item, index);
        });
      });
    },

    setCategory: function (dateTime) {
      const date = new Date(dateTime);
      const dateId = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
      const langCode = L10n.currentLanguage.startsWith('ar') ? 'ar-SA' : L10n.currentLanguage;

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
          const mime = window.SDCardManager.getMime(path);
          const imageSrc = `data:${mime};base64,${data}`;

          const item = document.createElement('div');
          item.classList.add('image');
          item.addEventListener('click', () => this.handleImageClick(imageSrc));

          const image = document.createElement('img');
          image.src = imageSrc;
          item.appendChild(image);

          const stats = window.SDCardManager.getStats(path);
          this.setCategory(stats.birthtime).appendChild(item);
        });
    },

    handleImageClick: function (image) {
      ImageViewer.open(image, this.images);
    }
  };

  window.addEventListener('load', () => Library.init());
})(window);
