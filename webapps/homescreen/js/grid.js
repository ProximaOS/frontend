!(function (exports) {
  'use strict';

  const Grid = {
    gridColumns: 4,
    gridRows: 6,
    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme'],
    APP_ICON_SIZE: 45,

    gridElement: document.getElementById('grid'),
    dropIndicatorElement: document.getElementById('drop-indicator'),
    apps: [],

    init: function () {
      this.gridElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-rows', this.gridRows);

      const apps = window.AppsManager.getAll();
      apps.then((data) => {
        this.apps = data;
        this.createIcons();
      });
    },

    createIcons: function () {
      let index = 0;
      this.apps.forEach((app) => {
        if (
          this.HIDDEN_ROLES.indexOf(app.manifest.role) !== -1
        ) {
          return;
        }

        const icon = document.createElement('div');
        icon.id = `appicon${index}`;
        icon.classList.add('icon');
        icon.addEventListener('click', (event) => this.handleAppClick(event, app));
        this.gridElement.appendChild(icon);

        const iconHolder = document.createElement('div');
        iconHolder.classList.add('icon-holder');
        icon.appendChild(iconHolder);

        const iconContainer = document.createElement('img');
        iconContainer.crossOrigin = 'anonymous';
        Object.entries(app.manifest.icons).forEach((entry) => {
          if (entry[0] <= this.APP_ICON_SIZE) {
            return;
          }
          iconContainer.src = entry[1];
        });
        iconContainer.onerror = () => {
          iconContainer.src = '/images/default.png';
        };
        iconHolder.appendChild(iconContainer);

        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = app.manifest.name;
        icon.appendChild(name);

        index++;
      });
    },

    handleAppClick: function (event, app) {
      let langCode;
      try {
        langCode = navigator.mozL10n.language.code || 'en-US';
      } catch (error) {
        // If an error occurs, set a default value for langCode
        langCode = 'en-US';
      }

      let manifestUrl;
      if (app.manifestUrl[langCode]) {
        manifestUrl = app.manifestUrl[langCode];
      } else {
        manifestUrl = app.manifestUrl['en-US'];
      }

      if (!Grid.isDragging) {
        // Dispatch the custom event with the manifest URL
        window.IPC.send('message', {
          type: 'launch',
          manifestUrl
          // icon_x: x,
          // icon_y: y,
          // icon_width: width,
          // icon_height: height
        });
      }
    }
  };

  window.addEventListener('load', function () {
    setTimeout(() => {
      Grid.init();
    }, 1000);
  });
})(window);
