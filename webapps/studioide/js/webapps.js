!(function (exports) {
  'use strict';

  const Webapps = {
    webappsList: document.getElementById('webapps-list'),

    APP_ICON_SIZE: 40,

    init: function () {
      // Fetch available networks and populate the list
      const apps = AppsManager.getAll();
      apps.then((data) => {
        data.forEach((app) => {
          const element = document.createElement('li');
          this.webappsList.appendChild(element);

          const icon = document.createElement('img');
          icon.crossOrigin = 'anonymous';
          if (app.manifest.icons) {
            Object.entries(app.manifest.icons).forEach((entry) => {
              if (entry[0] <= this.APP_ICON_SIZE) {
                return;
              }
              icon.src = entry[1];
            });
          } else {
            icon.src = '/images/default.svg';
          }
          icon.onerror = () => {
            icon.src = '/images/default.svg';
          };
          element.appendChild(icon);

          const textHolder = document.createElement('div');
          element.appendChild(textHolder);

          const name = document.createElement('p');
          name.textContent = app.manifest.name;
          textHolder.appendChild(name);

          const size = document.createElement('p');
          size.textContent = app.size;
          textHolder.appendChild(size);

          PageController.init();
        });
      });
    },
  };

  Webapps.init();
})(window);
