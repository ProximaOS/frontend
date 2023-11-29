!(function (exports) {
  'use strict';

  const Bookmarks = {
    bookmarks: document.getElementById('bookmarks'),

    init: async function () {
      const fragment = document.createDocumentFragment();

      const savedBookmarks = await Settings.getValue('bookmarks', 'bookmarks.json');
      for (let index = 0; index < savedBookmarks.length; index++) {
        const bookmark = savedBookmarks[index];

        const element = document.createElement('div');
        element.classList.add('bookmark');
        element.onclick = () => {
          location.href = bookmark.url;
        };
        fragment.appendChild(element);

        const iconHolder = document.createElement('div');
        iconHolder.classList.add('icon-holder');
        element.appendChild(iconHolder);

        const icon = document.createElement('img');
        icon.classList.add('icon');
        icon.src = `https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=128`;
        iconHolder.appendChild(icon);

        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = bookmark.name;
        element.appendChild(name);
      }

      this.bookmarks.appendChild(fragment);
    }
  };

  Bookmarks.init();
})(window);
