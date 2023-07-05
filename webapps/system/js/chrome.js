const Browser = {
  chrome: document.getElementById('chrome'),
  DEFAULT_URL: 'https://www.duckduckgo.com',

  tablist: function() {
    return this.chrome.querySelector('.tablist');
  },

  addButton: function() {
    return this.chrome.querySelector('.add-button');
  },

  navbarBackButton: function() {
    return this.chrome.querySelector('.navbar-back-button');
  },

  navbarForwardButton: function() {
    return this.chrome.querySelector('.navbar-forward-button');
  },

  navbarReloadButton: function() {
    return this.chrome.querySelector('.navbar-reload-button');
  },

  navbarHomeButton: function() {
    return this.chrome.querySelector('.navbar-home-button');
  },

  urlbar: function() {
    return this.chrome.querySelector('.urlbar');
  },

  urlbarInput: function() {
    return this.chrome.querySelector('.urlbar-input');
  },

  urlbarDisplayUrl: function() {
    return this.chrome.querySelector('.urlbar-display-url');
  },

  browserContainer: function() {
    return this.chrome.querySelector('.browser-container');
  },

  init: function(chromeElement, url, isChromeEnabled) {
    if (chromeElement) {
      this.chrome = chromeElement;
      this.chrome.innerHTML = `
        <div class="toolbar">
          <div class="tablist-holder">
            <button class="profile-button" data-icon="user"></button>
            <button class="sidetabs-button" data-icon="browser-sidetabs"></button>
            <ul class="tablist"></ul>
            <button class="add-button" data-icon="browser-addtab"></button>
          </div>
          <div class="navbar">
            <button class="navbar-back-button" data-icon="browser-back"></button>
            <button class="navbar-forward-button" data-icon="browser-forward"></button>
            <button class="navbar-reload-button" data-icon="browser-reload"></button>
            <button class="navbar-home-button" data-icon="browser-home"></button>
            <div class="urlbar">
              <button class="urlbar-ssl" data-icon="browser-ssl"></button>
              <input type="url" class="urlbar-input" />
              <div class="urlbar-display-url"></div>
              <button class="urlbar-bookmark" data-icon="browser-bookmark"></button>
              <button class="urlbar-go" data-icon="browser-forward"></button>
            </div>
            <button class="navbar-downloads-button" data-icon="browser-downloads"></button>
            <button class="navbar-library-button" data-icon="browser-library"></button>
            <button class="navbar-addons-button" data-icon="browser-addons"></button>
            <button class="navbar-options-button" data-icon="browser-options"></button>
          </div>
        </div>
        <div class="browser-container"></div>
      `;
    }
    if (isChromeEnabled) {
      this.chrome.classList.add('visible');
    }
    this.openNewTab(false, url);

    this.addButton().addEventListener('click', this.openNewTab.bind(this, false));
    this.urlbarInput().addEventListener('keydown', this.handleUrlbarInputKeydown.bind(this));
    this.navbarBackButton().addEventListener('click', this.handleNavbarBackButton.bind(this));
    this.navbarForwardButton().addEventListener('click', this.handleNavbarForwardButton.bind(this));
    this.navbarReloadButton().addEventListener('click', this.handleNavbarReloadButton.bind(this));
    this.navbarHomeButton().addEventListener('click', this.handleNavbarHomeButton.bind(this));
  },

  openNewTab: function(isPrivate, url) {
    var tab = document.createElement('li');
    this.tablist().appendChild(tab);

    var favicon = document.createElement('img');
    favicon.classList.add('favicon');
    tab.appendChild(favicon);

    var title = document.createElement('span');
    title.classList.add('title');
    tab.appendChild(title);

    var closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.dataset.icon = 'close';
    tab.appendChild(closeButton);

    var webview = document.createElement('webview');
    webview.src = url || this.DEFAULT_URL;
    webview.classList.add('browser');
    webview.nodeintegration = true;
    webview.nodeintegrationinsubframes = true;
    webview.disablewebsecurity = true;
    webview.webpreferences = "contextIsolation=false";
    webview.useragent = navigator.userAgent;
    webview.preload = `file://./preload.js`;
    this.browserContainer().appendChild(webview);

    webview.addEventListener('context-menu', this.handleContextMenu.bind(this));
    webview.addEventListener('page-favicon-updated', this.handlePageFaviconUpdated.bind(this));
    webview.addEventListener('page-title-updated', this.handlePageTitleUpdated.bind(this));
    webview.addEventListener('did-start-navigation', this.handleDidStartNavigation.bind(this));
    webview.addEventListener('did-change-theme-color', this.handleThemeColorUpdated.bind(this));
    webview.addEventListener('', this.handleThemeColorUpdated.bind(this));

    const ipcListener = EventListener.appWindow;
    const pattern = /^http:\/\/.*\.localhost:8081\//;
    const cssURL = `http://shared.localhost:${location.port}/style/webview.css`;
    const jsURL = `http://shared.localhost:${location.port}/js/webview.js`;


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

    const focus = () => {
      var tabs = this.chrome.querySelectorAll('.tablist li');
      tabs.forEach(function(tab) {
        tab.classList.remove('active');
      });

      var webviews = this.chrome.querySelectorAll('.browser-container webview');
      webviews.forEach(function(webview) {
        webview.classList.remove('active');
      });

      tab.classList.add('active');
      webview.classList.add('active');
    };

    focus();
    tab.addEventListener('click', focus.bind(this));
    closeButton.addEventListener('click', () => {
      tab.remove();
      webview.remove();
    });
  },

  handleUrlbarInputKeydown: function(event) {
    if (event.key === 'Enter') {
      var activeTab = this.chrome.querySelector('.tablist li.active');
      var webview = this.chrome.querySelector('.browser-container .browser.active');
      var url = event.target.value;
      webview.src = url;
    }
  },

  handleNavbarBackButton: function() {
    var webview = this.chrome.querySelector('.browser-container .browser.active');
    if (webview.canGoBack()) {
      webview.goBack();
    }
  },

  handleNavbarForwardButton: function() {
    var webview = this.chrome.querySelector('.browser-container .browser.active');
    if (webview.canGoForward()) {
      webview.goForward();
    }
  },

  handleNavbarReloadButton: function() {
    var webview = this.chrome.querySelector('.browser-container .browser.active');
    webview.reload();
  },

  handleNavbarHomeButton: function() {
    var webview = this.chrome.querySelector('.browser-container .browser.active');
    webview.src = this.DEFAULT_URL;
  },

  handleContextMenu: function(event) {
    console.log(event);
    contextMenu(event.params.x, event.params.y, [
      {
        name: 'Copy',
        disabled: !event.params.editFlags.canCopy,
        onclick: () => {
          webview.focus();
          webview.copy();
        },
      },
      {
        name: 'Cut',
        disabled: !event.params.editFlags.canCut,
        onclick: () => {
          webview.focus();
          webview.cut();
        },
      },
      {
        name: 'Paste',
        disabled: !event.params.editFlags.canPaste,
        onclick: () => {
          webview.focus();
          webview.paste();
        },
      },
      {
        name: 'Select All',
        disabled: !event.params.editFlags.canSelectAll,
        onclick: () => {
          webview.focus();
          webview.selectAll();
        },
      },
      {
        name: 'Delete',
        disabled: !event.params.editFlags.canDelete,
        onclick: () => {
          webview.focus();
          webview.delete();
        },
      },
    ]);
  },

  handlePageFaviconUpdated: function(event) {
    var favicon = this.chrome.querySelector('.tablist .active .favicon');
    favicon.src = event.favicons[0];
  },

  handlePageTitleUpdated: function(event) {
    var title = this.chrome.querySelector('.tablist .active .title');
    title.textContent = event.title;
  },

  handleDidStartNavigation: function() {
    var webview = this.chrome.querySelector('.browser-container .browser.active');
    this.urlbarInput().value = webview.getURL();
    var url = new URL(webview.getURL());
    this.urlbarDisplayUrl().innerHTML = `
      <div class="ignored">${url.protocol}//</div>
      <div class="highlighted">${url.host}</div>
      <div class="ignored">${url.pathname}</div>
      <div class="ignored">${url.search}</div>
      <div class="ignored">${url.hash}</div>
    `;
  },

  handleThemeColorUpdated: function(event) {
    var webview = this.chrome.querySelector('.browser-container .browser.active');
    const color = event.themeColor;
    webview.dataset.themeColor = color;
    this.chrome.style.setProperty('--theme-color', color);

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
