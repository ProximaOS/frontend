const AppWindow = {
  _id: 0,

  screen: document.getElementById('screen'),
  containerElement: document.getElementById('windows'),
  statusbar: document.getElementById('statusbar'),
  softwareButtons: document.getElementById('software-buttons'),
  keyboard: document.getElementById('keyboard'),
  softwareBackButton: document.getElementById('software-back-button'),
  softwareHomeButton: document.getElementById('software-home-button'),
  dock: document.getElementById('dock'),

  HIDDEN_ROLES: [ 'system', 'homescreen' ],

  OPEN_ANIMATION: 'expand',
  CLOSE_ANIMATION: 'shrink',

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

      icon.classList.add(this.OPEN_ANIMATION);
      icon.addEventListener('animationend', () => {
        icon.classList.remove(this.OPEN_ANIMATION);
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
    if (manifest.transparent) {
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

    windowDiv.classList.add(this.OPEN_ANIMATION);
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove(this.OPEN_ANIMATION);
    });

    var splashScreen = document.createElement('div');
    splashScreen.classList.add('splashscreen');
    windowDiv.appendChild(splashScreen);

    var splashScreenIcon = document.createElement('img');
    splashScreenIcon.classList.add('icon');
    splashScreen.appendChild(splashScreenIcon);
    if (manifest.icons) {
      Object.entries(manifest.icons).forEach((icon) => {
        var url = new URL(manifestUrl);
        manifest.icons[icon[0]] = `${url.origin}${icon[1]}`;
        splashScreenIcon.src = manifest.icons[45];
      });
    }

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

    this.handleThemeColorFocusUpdated(id);
  },

  close: function (id) {
    if (id === 'homescreen') {
      return;
    }
    var windowDiv = document.getElementById(id);
    var manifestUrl = windowDiv.dataset.manifestUrl;
    var dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

    windowDiv.classList.add(this.CLOSE_ANIMATION);
    if (dockIcon) {
      dockIcon.classList.add(this.CLOSE_ANIMATION);
    }
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove(this.CLOSE_ANIMATION);
      windowDiv.remove();
      if (dockIcon) {
        dockIcon.classList.remove(this.CLOSE_ANIMATION);
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

    windowDiv.classList.add(this.CLOSE_ANIMATION);
    if (dockIcon) {
      dockIcon.classList.add('minimized');
    }
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove('active');
      windowDiv.classList.remove(this.CLOSE_ANIMATION);
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
    windowDiv.classList.add(this.OPEN_ANIMATION);
    if (dockIcon) {
      dockIcon.classList.remove('minimized');
    }
    windowDiv.addEventListener('animationend', () => {
      windowDiv.classList.remove(this.OPEN_ANIMATION);
      this.focus(id);
    });
  },

  onButtonClick: function (event) {
    switch (event.target) {
      case this.softwareBackButton:
        if (!this.screen.classList.contains('keyboard-visible')) {
          var webview = this.focusedWindow.querySelector('.browser.active');
          if (webview.canGoBack()) {
            webview.goBack();
          } else {
            this.close(this.focusedWindow.id);
          }
        } else {
          this.screen.classList.remove('keyboard-visible');
          this.keyboard.classList.remove('visible');
        }
        break;

      case this.softwareHomeButton:
        this.minimize(this.focusedWindow.id);
        break;

      default:
        break;
    }
  },

  handleThemeColorFocusUpdated: function(id) {
    var windowDiv = document.getElementById(id);
    var webview = windowDiv.querySelector('.browser-container .browser.active');
    var color;
    if (webview) {
      color = webview.dataset.themeColor;
      if (!color) {
        return;
      }
    } else {
      return;
    }

    // Calculate the luminance of the color
    const luminance = this.calculateLuminance(color);

    // If the color is light (luminance > 0.5), add 'light' class to the status bar
    if (luminance > 0.5) {
      this.statusbar.classList.add('light');
      this.softwareButtons.classList.add('light');
      this.statusbar.classList.remove('dark');
      this.softwareButtons.classList.remove('dark');
    } else {
      // Otherwise, remove 'light' class
      this.statusbar.classList.remove('light');
      this.softwareButtons.classList.remove('light');
      this.statusbar.classList.add('dark');
      this.softwareButtons.classList.add('dark');
    }
  },

  calculateLuminance: function (color) {
    // Convert the color to RGB values
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);

    // Calculate relative luminance
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return luminance;
  },
};

AppWindow.init();
