!(function (exports) {
  'use strict';

  const Webapps = {
    webappsList: document.getElementById('webapps-list'),
    webappInfoIcon: document.getElementById('webappInfo-icon'),
    webappInfoName: document.getElementById('webappInfo-name'),
    webappInfoVersion: document.getElementById('webappInfo-version'),
    webappInfoAuthor: document.getElementById('webappInfo-author'),

    APP_ICON_SIZE: 40,

    init: function () {
      // Fetch available networks and populate the list
      const apps = window.AppsManager.getAll();
      apps.then((data) => {
        data.forEach((app) => {
          const element = document.createElement('li');
          element.dataset.pageId = 'webappInfo';
          element.addEventListener('click', (event) =>
            this.handleWebappInfo(app, element)
          );
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
            icon.src = '/images/default.png';
          }
          icon.onerror = () => {
            icon.src = '/images/default.png';
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

    handleWebappInfo: function (app, element) {
      element.classList.remove('selected');

      this.webappInfoIcon.crossOrigin = 'anonymous';
      if (app.manifest.icons) {
        Object.entries(app.manifest.icons).forEach((entry) => {
          if (entry[0] <= this.APP_ICON_SIZE) {
            return;
          }
          this.webappInfoIcon.src = entry[1];
        });
      } else {
        this.webappInfoIcon.src = '/images/default.png';
      }
      this.webappInfoIcon.onerror = () => {
        this.webappInfoIcon.src = '/images/default.png';
      };

      this.webappInfoName.textContent = app.manifest.long_name || app.manifest.name;
      this.webappInfoVersion.textContent = app.manifest.version;
      if (app.manifest.developer) {
        this.webappInfoAuthor.textContent = app.manifest.developer.name;
        this.webappInfoAuthor.src = app.manifest.developer.url;
      }
    }
  };

  Webapps.init();
})(window);
