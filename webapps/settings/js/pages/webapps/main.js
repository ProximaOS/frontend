!(function (exports) {
  'use strict';

  const Webapps = {
    webappsList: document.getElementById('webapps-list'),

    APP_ICON_SIZE: 40,

    init: function () {
      // Fetch available networks and populate the list
      const apps = _session.appsManager.getAll();
      apps.then((data) => {
        data.forEach((item) => {
          const element = document.createElement('li');
          element.dataset.pageId = 'webappInfo';
          this.webappsList.appendChild(element);

          const icon = document.createElement('img');
          icon.crossOrigin = 'anonymous';
          if (item.manifest.icons) {
            Object.entries(item.manifest.icons).forEach((entry) => {
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
          name.textContent = item.manifest.name;
          textHolder.appendChild(name);

          const size = document.createElement('p');
          size.textContent = item.size;
          textHolder.appendChild(size);

          PageController.init();
        });
      });
    }
  };

  Webapps.init();
})(window);
