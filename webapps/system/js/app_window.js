const AppWindow = {
  _id: 0,

  containerElement: document.getElementById('windows'),
  statusbar: document.getElementById('statusbar'),
  softwareButtons: document.getElementById('software-buttons'),
  softwareBackButton: document.getElementById('software-back-button'),
  softwareHomeButton: document.getElementById('software-home-button'),
  dock: document.getElementById('dock'),

  HIDDEN_ROLES: [ 'system', 'homescreen' ],

  init: function () {
    this.softwareBackButton.addEventListener('click', this.onButtonClick.bind(this));
    this.softwareHomeButton.addEventListener('click', this.onButtonClick.bind(this));
  },

  create: async function (manifestUrl, options) {
    var existingWindow = this.containerElement.querySelector(`[data-manifest-url="${manifestUrl}"]`);
    if (existingWindow) {
      if (options.originPos) {
        if (this.homescreenElement) {
          this.homescreenElement.style.transformOrigin = `${options.originPos.x}px ${options.originPos.y}px`;
        }
        existingWindow.style.transformOrigin = `${options.originPos.x}px ${options.originPos.y}px`;
      }
      this.unminimize(existingWindow.id);
      return;
    }

    const windowId = `appframe${AppWindow._id}`;
    console.log(windowId + ': ' + manifestUrl);
    AppWindow._id++;

    var manifest;
    await fetch(manifestUrl)
      .then(response => response.json())
      .then(function (data) {
        manifest = data;
        // You can perform further operations with the 'manifest' variable here
      })
      .catch(function (error) {
        console.log('Error fetching manifest:', error);
      });

    // Apply window options
    const windowOptions = Object.assign(
      {
        start_url: manifest.start_url,
        launch_path: manifest.launch_path,
        width: manifest.width,
        height: manifest.height,
        transparent: manifest.transparent,
        cli_args: ''
      },
      options
    );

    // Create dock icon
    if (this.HIDDEN_ROLES.indexOf(manifest.role) == -1) {
      const icon = document.createElement('div');
      icon.classList.add('icon');
      icon.dataset.manifestUrl = manifestUrl;
      icon.onclick = () => {
        this.focus(windowId);
      };
      this.dock.appendChild(icon);

      icon.classList.add('expand');
      icon.addEventListener('animationend', () => {
        icon.classList.remove('expand');
      });

      const iconImage = document.createElement('img');
      Object.entries(manifest.icons).forEach(entry => {
        if (entry[0] >= this.DOCK_ICON_SIZE) {
          return;
        }
        const url = new URL(manifestUrl);
        iconImage.src = url.origin + entry[1];
      });
      icon.appendChild(iconImage);
    }

    // Create window container
    const windowDiv = document.createElement('div');
    windowDiv.dataset.manifestUrl = manifestUrl;
    if (manifest.role == 'homescreen') {
      windowDiv.id = 'homescreen';
      AppWindow.homescreenElement = windowDiv;
    } else {
      windowDiv.id = windowId;
    }
    windowDiv.classList.add('appframe');
    if (manifest.statusbar && manifest.statusbar !== 'normal') {
      windowDiv.classList.add(manifest.statusbar);
    }
    if (manifest.display && manifest.display !== 'standalone') {
      windowDiv.classList.add(manifest.display);
    }
    if (windowOptions.transparent) {
      windowDiv.classList.add('transparent');
    }
    if (windowOptions.originPos) {
      if (this.homescreenElement) {
        this.homescreenElement.style.transformOrigin = `${windowOptions.originPos.x}px ${windowOptions.originPos.y}px`;
      }
      windowDiv.style.transformOrigin = `${windowOptions.originPos.x}px ${windowOptions.originPos.y}px`;
    }
    this.containerElement.appendChild(windowDiv);

    // Focus the app window
    this.focus(windowDiv.id);

    windowDiv.classList.add('expand');
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove('expand');
    });

    // Create chrome
    var chromeContainer = document.createElement('div');
    chromeContainer.classList.add('chrome');
    windowDiv.appendChild(chromeContainer);

    var isChromeEnabled = false;
    if (manifest.chrome && manifest.chrome.navigation) {
      isChromeEnabled = true;
    }

    if (manifest.start_url) {
      Browser.init(chromeContainer, manifest.start_url, isChromeEnabled);
    } else {
      if (manifest.launch_path) {
        var url = new URL(manifestUrl);
        Browser.init(chromeContainer, url.origin + manifest.launch_path, isChromeEnabled);
      }
    }
  },

  focus: function (id) {
    var windowDiv = document.getElementById(id);
    var manifestUrl = windowDiv.dataset.manifestUrl;
    var dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

    this.containerElement.querySelectorAll('.appframe').forEach((element) => {
      element.classList.remove('active');
    });
    this.dock.querySelectorAll('.icon').forEach((element) => {
      element.classList.remove('active');
    });

    windowDiv.classList.add('active');
    if (dockIcon) {
      dockIcon.classList.add('active');
    }
    this.focusedWindow = windowDiv;
  },

  close: function (id) {
    if (id === 'homescreen') {
      return;
    }
    var windowDiv = document.getElementById(id);
    var manifestUrl = windowDiv.dataset.manifestUrl;
    var dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

    windowDiv.classList.add('shrink');
    if (dockIcon) {
      dockIcon.classList.add('shrink');
    }
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove('shrink');
      windowDiv.remove();
      if (dockIcon) {
        dockIcon.classList.remove('shrink');
        dockIcon.remove();
      }
      this.focus('homescreen');
    });
  },

  minimize: function (id) {
    if (id === 'homescreen') {
      return;
    }
    var windowDiv = document.getElementById(id);
    var manifestUrl = windowDiv.dataset.manifestUrl;
    var dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

    windowDiv.classList.add('shrink');
    if (dockIcon) {
      dockIcon.classList.add('minimized');
    }
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove('active');
      windowDiv.classList.remove('shrink');
      this.focus('homescreen');
    });
  },

  unminimize: function (id) {
    if (id === 'homescreen') {
      return;
    }
    var windowDiv = document.getElementById(id);
    var manifestUrl = windowDiv.dataset.manifestUrl;
    var dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

    windowDiv.classList.add('active');
    windowDiv.classList.add('expand');
    if (dockIcon) {
      dockIcon.classList.remove('minimized');
    }
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove('expand');
      this.focus(id);
    });
  },

  onButtonClick: function (event) {
    switch (event.target) {
      case this.softwareBackButton:
        var webview = this.focusedWindow.querySelector('.browser.active');
        if (webview.canGoBack()) {
          webview.goBack();
        } else {
          this.close(this.focusedWindow.id);
        }
        break;

      case this.softwareHomeButton:
        this.minimize(this.focusedWindow.id);
        break;

      default:
        break;
    }
  },
};

AppWindow.init();
