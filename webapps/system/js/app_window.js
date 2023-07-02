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

    // Create webview
    const webview = document.createElement('webview');
    webview.classList.add('browser');
    webview.nodeintegration = true;
    webview.nodeintegrationinsubframes = true;
    webview.disablewebsecurity = true;
    webview.webpreferences = "contextIsolation=false";
    webview.useragent = navigator.userAgent;
    webview.preload = `file://./preload.js`;
    windowDiv.appendChild(webview);

    // Use timeout to delay webview changes so they happen after webview loads
    setTimeout(() => {
      const ipcListener = EventListener.appWindow;
      const pattern = /^http:\/\/.*\.localhost:8081\//;
      const cssURL = `http://shared.localhost:${location.port}/style/webview.css`;
      const jsURL = `http://shared.localhost:${location.port}/js/webview.js`;

      webview.addEventListener('did-change-theme-color', (event) => {
        const color = event.themeColor;
        windowDiv.dataset.themeColor = color;
        windowDiv.style.backgroundColor = color;

        // Calculate the luminance of the color
        const luminance = this.calculateLuminance(color);

        // If the color is light (luminance > 0.5), add 'light' class to the status bar
        if (luminance > 0.5) {
          this.statusbar.classList.add('light');
          this.softwareButtons.classList.add('light');
        } else {
          // Otherwise, remove 'light' class
          this.statusbar.classList.remove('light');
          this.softwareButtons.classList.remove('light');
        }
      });

      ['did-start-loading', 'did-start-navigation', 'did-stop-loading', 'dom-ready'].forEach((eventType) => {
        webview.addEventListener(eventType, () => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', cssURL, true);
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
              const cssContent = xhr.responseText;
              webview.insertCSS(cssContent);
            } else if (xhr.readyState === 4) {
              console.error('Failed to fetch CSS:', xhr.status, xhr.statusText);
            }
          };
          xhr.send();

          const xhr1 = new XMLHttpRequest();
          xhr1.open('GET', jsURL, true);
          xhr1.onreadystatechange = function () {
            if (xhr1.readyState === 4 && xhr1.status === 200) {
              const jsContent = xhr1.responseText;
              webview.executeJavaScript(jsContent);
            } else if (xhr1.readyState === 4) {
              console.error('Failed to fetch JS:', xhr1.status, xhr1.statusText);
            }
          };
          xhr1.send();

          if (pattern.test(webview.getURL())) {
            webview.nodeintegration = true;
            webview.nodeintegrationinsubframes = true;
            webview.disablewebsecurity = true;
            webview.webpreferences = "contextIsolation=false";
            webview.addEventListener('ipc-message', ipcListener);
          } else {
            webview.nodeintegration = false;
            webview.nodeintegrationinsubframes = false;
            webview.disablewebsecurity = false;
            webview.webpreferences = "contextIsolation=true";
            webview.removeEventListener('ipc-message', ipcListener);
          }
        });
      });

      if (windowOptions.start_url) {
        webview.src = windowOptions.start_url;
      } else {
        if (windowOptions.launch_path) {
          const url = new URL(manifestUrl);
          webview.src = url.origin + windowOptions.launch_path;
        }
      }
    }, 100);
  },

  createTabs: function (id) {
    // Create tabs container
    const tabsDiv = document.createElement('div');
    tabsDiv.classList.add('tabs');
    windowDiv.appendChild(tabsDiv);
  },

  createNavbar: function (id) {
    // Create navigation bar
    const navbar = document.createElement('div');
    navbar.classList.add('navbar');
    windowDiv.appendChild(navbar);
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

    // var color = 'rgb(0, 0, 0)';
    // if (windowDiv && windowDiv.dataset.themeColor) {
    //   color = windowDiv.dataset.themeColor;
    // }

    // // Calculate the luminance of the color
    // const luminance = this.calculateLuminance(color);

    // // If the color is light (luminance > 0.5), add 'light' class to the status bar
    // if (luminance > 0.5) {
    //   this.statusbar.classList.add('light');
    //   this.softwareButtons.classList.add('light');
    // } else {
    //   // Otherwise, remove 'light' class
    //   this.statusbar.classList.remove('light');
    //   this.softwareButtons.classList.remove('light');
    // }
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

  // Helper function to calculate the luminance of a color
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

  onButtonClick: function (event) {
    switch (event.target) {
      case this.softwareBackButton:
        var webview = this.focusedWindow.querySelector('webview');
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
