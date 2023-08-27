!(function (exports) {
  'use strict';

  const Webapps = {
    webappsContainer: document.getElementById('webapps-list'),

    data: null,

    init: function () {
      fetch('https://banana-hackers.gitlab.io/store-db/data.json')
        .then((response) => response.json())
        .then((data) => {
          this.data = data;
          console.log(data);

          this.createList();
        });
    },

    createList: function () {
      this.data.apps.forEach(item => {
        const webapp = document.createElement('a');
        webapp.classList.add('webapp');
        this.webappsContainer.appendChild(webapp);

        const iconHolder = document.createElement('div');
        iconHolder.classList.add('icon-holder');
        webapp.appendChild(iconHolder);

        const icon = document.createElement('img');
        icon.src = item.icon;
        icon.classList.add('icon');
        iconHolder.appendChild(icon);

        const textHolder = document.createElement('div');
        textHolder.classList.add('text-holder');
        webapp.appendChild(textHolder);

        const name = document.createElement('div');
        name.textContent = item.name;
        name.classList.add('name');
        textHolder.appendChild(name);
      });
    }
  };

  Webapps.init();
})(window);
