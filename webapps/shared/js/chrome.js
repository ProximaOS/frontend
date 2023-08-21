!(function (exports) {
  'use strict';

  const Browser = {
    _id: 0,

    DEFAULT_URL: 'https://www.duckduckgo.com',

    chrome: document.getElementById('chrome'),
    statusbar: document.getElementById('statusbar'),
    softwareButtons: document.getElementById('software-buttons'),

    toolbar: function () {
      return this.chrome.querySelector('.toolbar');
    },

    tablist: function () {
      return this.chrome.querySelector('.tablist');
    },

    profileButton: function () {
      return this.chrome.querySelector('.profile-button');
    },

    sideTabsButton: function () {
      return this.chrome.querySelector('.side-tabs-button');
    },

    addButton: function () {
      return this.chrome.querySelector('.add-button');
    },

    navbarBackButton: function () {
      return this.chrome.querySelector('.navbar-back-button');
    },

    navbarForwardButton: function () {
      return this.chrome.querySelector('.navbar-forward-button');
    },

    navbarReloadButton: function () {
      return this.chrome.querySelector('.navbar-reload-button');
    },

    navbarHomeButton: function () {
      return this.chrome.querySelector('.navbar-home-button');
    },

    navbarTabsButton: function () {
      return this.chrome.querySelector('.navbar-tabs-button');
    },

    navbarOptionsButton: function () {
      return this.chrome.querySelector('.navbar-options-button');
    },

    urlbar: function () {
      return this.chrome.querySelector('.urlbar');
    },

    urlbarInput: function () {
      return this.chrome.querySelector('.urlbar-input');
    },

    urlbarDisplayUrl: function () {
      return this.chrome.querySelector('.urlbar-display-url');
    },

    browserContainer: function () {
      return this.chrome.querySelector('.browser-container');
    },

    tabsView: function () {
      return this.chrome.querySelector('.tabs-view');
    },

    tabsViewCloseButton: function () {
      return this.chrome.querySelector('.tabs-view-close-button');
    },

    tabsViewAddButton: function () {
      return this.chrome.querySelector('.tabs-view-add-button');
    },

    tabsViewList: function () {
      return this.chrome.querySelector('.tabs-view .grid');
    },

    ftuDialog: function () {
      return this.chrome.querySelector('.ftu-dialog');
    },

    init: function (chromeElement, url, isChromeEnabled = true) {
      if (chromeElement) {
        this.chrome = chromeElement;
        this.chrome.innerHTML = `
          <div class="toolbar">
            <div class="tablist-holder">
              <button class="profile-button" data-icon="user" data-l10n-id="profile-button">
                <img src="" alt="" class="avatar">
              </button>
              <button class="side-tabs-button" data-icon="browser-sidetabs" data-l10n-id="tablist-sideTabsButton"></button>
              <ul class="tablist"></ul>
              <button class="add-button" data-icon="browser-addtab" data-l10n-id="tablist-addButton"></button>
            </div>
            <div class="navbar">
              <button class="navbar-back-button" data-icon="browser-back" data-l10n-id="navbar-backButton"></button>
              <button class="navbar-forward-button" data-icon="browser-forward" data-l10n-id="navbar-forwardButton"></button>
              <button class="navbar-reload-button" data-icon="browser-reload" data-l10n-id="navbar-reloadButton"></button>
              <button class="navbar-home-button" data-icon="browser-home" data-l10n-id="navbar-homeButton"></button>
              <div class="urlbar">
                <button class="urlbar-ssl" data-icon="browser-ssl" data-l10n-id="urlbar-sslButton"></button>
                <input type="url" class="urlbar-input" />
                <div class="urlbar-display-url" data-l10n-id="urlbar"></div>
                <button class="urlbar-bookmark" data-icon="browser-bookmark" data-l10n-id="urlbar-bookmarkButton"></button>
                <button class="urlbar-go" data-icon="browser-forward" data-l10n-id="urlbar-goButton"></button>
              </div>
              <button class="navbar-tabs-button" data-icon="browser-windows" data-l10n-id="navbar-tabsButton"></button>
              <button class="navbar-downloads-button" data-icon="browser-downloads" data-l10n-id="navbar-downloadsButton"></button>
              <button class="navbar-library-button" data-icon="browser-library" data-l10n-id="navbar-libraryButton"></button>
              <button class="navbar-addons-button" data-icon="browser-addons" data-l10n-id="navbar-addonsButton"></button>
              <button class="navbar-options-button" data-icon="browser-options" data-l10n-id="navbar-optionsButton"></button>
            </div>
          </div>
          <div class="browser-container"></div>
          <div class="tabs-view">
            <div class="container">
              <div class="grippy-bar"></div>
              <div class="headerbar">
                <h1 data-l10n-id="tabsView"></h1>
                <menu role="toolbar">
                  <a href="#" class="tabs-view-add-button" data-icon="add" data-l10n-id="tabsView-newButton"></a>
                  <a href="#" class="tabs-view-close-button" data-icon="close" data-l10n-id="tabsView-closeButton"></a>
                </menu>
              </div>
              <div class="grid"></div>
            </div>
          </div>
          <div class="ftu-dialog">
            <div class="container">
              <div class="greetings page visible">
                <div class="illustration">
                  <div class="illustration-art"></div>
                </div>
                <div class="content">
                  <h3>Hello!</h3>
                  <p>lorem ipsum</p>
                  <ul>
                    <li>lorem ipsum</li>
                    <li>lorem ipsum</li>
                    <li>lorem ipsum</li>
                  </ul>
                </div>
                <div class="buttons">
                  <button class="next-button next recommend" data-icon="forward" data-page-id="customize">Next</button>
                </div>
              </div>
              <div class="customize page">
                <div class="illustration">
                  <div class="illustration-art"></div>
                </div>
                <div class="content">
                  <h3>Customize</h3>
                  <p>Pick your preferred profile picture and accent color.</p>
                  <div class="accent-colors">
                    <div class="red"></div>
                    <div class="yellow"></div>
                    <div class="green"></div>
                    <div class="blue default"></div>
                    <div class="purple"></div>
                  </div>
                </div>
                <div class="buttons">
                  <button class="previous-button" data-icon="back" data-page-id="greetings">Previous</button>
                  <button class="next-button next recommend" data-icon="forward" data-page-id="account">Next</button>
                </div>
              </div>
              <div class="account page">
                <div class="illustration">
                  <div class="illustration-art"></div>
                </div>
                <div class="content">
                  <h3>Orchid Account</h3>
                  <p>Login or sign up to sync your data between your Orchid devices.</p>
                  <button>Login</button>
                  <a href="#">Or sign up instead</a>
                </div>
                <div class="buttons">
                  <button class="previous-button" data-icon="back" data-page-id="customize">Previous</button>
                  <button class="done-button next recommend" data-icon="forward">Done</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      if (isChromeEnabled) {
        this.chrome.classList.add('visible');
        this.openFtuDialog();
      }

      _session.settings.getValue('general.chrome.position').then((data) => {
        this.chrome.classList.add(data);
      });
      _session.settings.addObserver('general.chrome.position', (data) => {
        this.chrome.classList.remove('top');
        this.chrome.classList.remove('bottom');
        this.chrome.classList.add(data);
      });

      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        if (this.statusbar) {
          this.statusbar.classList.add('light');
        }
        if (this.softwareButtons) {
          this.softwareButtons.classList.add('light');
        }
        this.chrome.classList.add('light');
        this.chrome.parentElement.classList.add('light');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (this.statusbar) {
          this.statusbar.classList.add('dark');
        }
        if (this.softwareButtons) {
          this.softwareButtons.classList.add('dark');
        }
        this.chrome.classList.add('dark');
        this.chrome.parentElement.classList.add('dark');
      }

      this.chrome.dataset.id = 0;
      this.DEFAULT_URL = url;
      this.openNewTab(false, url);

      const avatarImage = this.profileButton().querySelector('.avatar');
      if ('OrchidServices' in window) {
        if (OrchidServices.isUserLoggedIn()) {
          this.profileButton().classList.add('logged-in');
          OrchidServices.getWithUpdate(
            `profile/${OrchidServices.userId()}`,
            function (data) {
              avatarImage.src = data.profile_picture;
            }
          );
        }
      }

      this.sideTabsButton().addEventListener(
        'click',
        this.handeSideTabsButton.bind(this)
      );
      this.addButton().addEventListener(
        'click',
        this.openNewTab.bind(this, false)
      );
      this.urlbarInput().addEventListener(
        'keydown',
        this.handleUrlbarInputKeydown.bind(this)
      );
      this.navbarBackButton().addEventListener(
        'click',
        this.handleNavbarBackButton.bind(this)
      );
      this.navbarForwardButton().addEventListener(
        'click',
        this.handleNavbarForwardButton.bind(this)
      );
      this.navbarReloadButton().addEventListener(
        'click',
        this.handleNavbarReloadButton.bind(this)
      );
      this.navbarHomeButton().addEventListener(
        'click',
        this.handleNavbarHomeButton.bind(this)
      );
      this.navbarTabsButton().addEventListener(
        'click',
        this.handleNavbarTabsButton.bind(this)
      );
      this.navbarOptionsButton().addEventListener(
        'click',
        this.handleNavbarOptionsButton.bind(this)
      );
      this.tabsViewCloseButton().addEventListener(
        'click',
        this.handleTabsViewCloseButton.bind(this)
      );
      this.tabsViewAddButton().addEventListener(
        'click',
        this.openNewTab.bind(this)
      );
    },

    handeSideTabsButton: function () {
      this.chrome.classList.toggle('sidetabs');
    },

    openNewTab: function (isPrivate = false, url) {
      this.chrome.dataset.id++;
      this.navbarTabsButton().dataset.amount = this.chrome.dataset.id;

      const tab = document.createElement('li');
      if (isPrivate) {
        tab.classList.add('private');
      }
      tab.classList.add('expand');
      tab.addEventListener('animationend', () => {
        tab.classList.remove('expand');
      });
      this.tablist().appendChild(tab);

      const favicons = document.createElement('div');
      favicons.classList.add('favicons');
      tab.appendChild(favicons);

      const favicon = document.createElement('img');
      favicon.classList.add('favicon');
      favicons.appendChild(favicon);

      const loadingIcon = document.createElement('div');
      loadingIcon.classList.add('loading-icon');
      loadingIcon.innerHTML = `
        <svg viewBox="0 0 16 16" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <style>
            path {
              animation: spinner 2s ease-in-out infinite;
              stroke-dasharray: 1,200;
              stroke-dashoffset: 0;
              fill: none;
              stroke-width: 2;
              stroke-miterlimit: 10;
              stroke-linecap: round;
              transform-origin: 50% 50%;
              stroke: var(--accent-color);
            }

            @keyframes spinner {
              0% {
                stroke-dasharray: 0,200;
                stroke-dashoffset: 0;
                transform: rotate(0deg);
              }
              100% {
                stroke-dasharray: 130,200;
                stroke-dashoffset: -43.9;
                transform: rotate(-360deg);
              }
            }
          </style>
          <path d="M8 1A1 1 0 008 15 1 1 0 008 1"></path>
        </svg>
      `;
      favicons.appendChild(loadingIcon);

      const title = document.createElement('span');
      title.classList.add('title');
      tab.appendChild(title);

      const closeButton = document.createElement('button');
      closeButton.classList.add('close-button');
      closeButton.dataset.icon = 'close';
      tab.appendChild(closeButton);

      const gridTab = document.createElement('div');
      gridTab.classList.add('tab');
      gridTab.classList.add('expand');
      gridTab.addEventListener('animationend', () => {
        gridTab.classList.remove('expand');
      });
      this.tabsViewList().appendChild(gridTab);

      const gridHeader = document.createElement('div');
      gridHeader.classList.add('header');
      gridTab.appendChild(gridHeader);

      const gridFavicon = document.createElement('img');
      gridFavicon.classList.add('favicon');
      gridHeader.appendChild(gridFavicon);

      const gridTitle = document.createElement('span');
      gridTitle.classList.add('title');
      gridHeader.appendChild(gridTitle);

      const gridCloseButton = document.createElement('button');
      gridCloseButton.classList.add('close-button');
      gridCloseButton.dataset.icon = 'close';
      gridHeader.appendChild(gridCloseButton);

      const gridPreview = document.createElement('img');
      gridPreview.classList.add('preview');
      gridTab.appendChild(gridPreview);

      const webview = document.createElement('webview');
      webview.src = url || this.DEFAULT_URL;
      webview.classList.add('browser');
      webview.nodeintegration = true;
      webview.nodeintegrationinsubframes = true;
      webview.disablewebsecurity = true;
      webview.webpreferences = 'contextIsolation=false';
      webview.useragent = navigator.userAgent;
      webview.preload = `file://${
        process.env.NODE_ENV === 'production'
          ? __dirname.replaceAll('\\', '/')
          : process.cwd().replaceAll('\\', '/')
      }/src/preload.js`;
      if (isPrivate) {
        webview.partition = 'private';
        webview.classList.add('private');
      }
      this.browserContainer().appendChild(webview);

      webview.addEventListener('ipc-message', this.handleIpcMessage.bind(this));
      webview.addEventListener(
        'context-menu',
        this.handleContextMenu.bind(this)
      );
      webview.addEventListener(
        'page-favicon-updated',
        this.handlePageFaviconUpdated.bind(this)
      );
      webview.addEventListener(
        'page-title-updated',
        this.handlePageTitleUpdated.bind(this)
      );
      webview.addEventListener(
        'did-start-navigation',
        this.handleDidStartNavigation.bind(this)
      );
      webview.addEventListener(
        'did-change-theme-color',
        this.handleThemeColorUpdated.bind(this)
      );

      const pattern = /^http:\/\/.*\.localhost:8081\//;
      const cssURL = `http://shared.localhost:${location.port}/style/webview.css`;
      const jsURL = `http://shared.localhost:${location.port}/js/webview.js`;

      webview.addEventListener('did-start-loading', () => {
        favicons.classList.add('loading');
      });

      webview.addEventListener('did-stop-loading', () => {
        favicons.classList.remove('loading');

        const splashElement =
          this.chrome.parentElement.querySelector('.splashscreen');
        if (splashElement) {
          splashElement.classList.add('hidden');
        }
      });

      [
        'did-start-loading',
        'did-start-navigation',
        'did-stop-loading',
        'dom-ready'
      ].forEach((eventType) => {
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
              console.error(
                'Failed to fetch JS:',
                xhr1.status,
                xhr1.statusText
              );
            }
          };
          xhr1.send();

          if (pattern.test(webview.getURL())) {
            webview.nodeintegration = true;
            webview.nodeintegrationinsubframes = true;
            webview.disablewebsecurity = true;
            webview.webpreferences = 'contextIsolation=false';
          } else {
            webview.nodeintegration = false;
            webview.nodeintegrationinsubframes = false;
            webview.disablewebsecurity = false;
            webview.webpreferences = 'contextIsolation=true';
          }

          if (!isPrivate) {
            webview.capturePage().then((data) => {
              gridPreview.src = data.toDataURL();
            });
          }
        });
      });

      const focus = () => {
        const tabs = this.chrome.querySelectorAll('.tablist li');
        tabs.forEach(function (tab) {
          tab.classList.remove('active');
        });

        const gridTabs = this.chrome.querySelectorAll('.tabs-view .grid .tab');
        gridTabs.forEach(function (gridTab) {
          gridTab.classList.remove('active');
        });

        const webviews = this.chrome.querySelectorAll(
          '.browser-container webview'
        );
        webviews.forEach(function (webview) {
          webview.classList.remove('active');
        });

        tab.classList.add('active');
        gridTab.classList.add('active');
        webview.classList.add('active');
      };

      focus();

      tab.addEventListener('click', focus.bind(this));
      gridTab.addEventListener('click', focus.bind(this));

      closeButton.addEventListener('click', (event) => {
        event.stopPropagation();

        this.chrome.dataset.id--;
        this.navbarTabsButton().dataset.amount = this.chrome.dataset.id;

        tab.classList.add('shrink');
        tab.addEventListener('animationend', () => {
          tab.classList.remove('shrink');
          tab.remove();
        });
        gridTab.classList.add('shrink');
        gridTab.addEventListener('animationend', () => {
          gridTab.classList.remove('shrink');
          gridTab.remove();
        });
        webview.remove();
      });

      gridCloseButton.addEventListener('click', (event) => {
        event.stopPropagation();

        this.chrome.dataset.id--;
        this.navbarTabsButton().dataset.amount = this.chrome.dataset.id;

        tab.classList.add('shrink');
        tab.addEventListener('animationend', () => {
          tab.classList.remove('shrink');
          tab.remove();
        });
        gridTab.classList.add('shrink');
        gridTab.addEventListener('animationend', () => {
          gridTab.classList.remove('shrink');
          gridTab.remove();
        });
        webview.remove();
      });
    },

    handleUrlbarInputKeydown: function (event) {
      if (event.key === 'Enter') {
        const webview = this.chrome.querySelector(
          '.browser-container .browser.active'
        );
        const url = event.target.value;
        webview.src = url;
      }
    },

    handleNavbarBackButton: function () {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      if (webview.canGoBack()) {
        webview.goBack();
      }
    },

    handleNavbarForwardButton: function () {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      if (webview.canGoForward()) {
        webview.goForward();
      }
    },

    handleNavbarReloadButton: function () {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      webview.reload();
    },

    handleNavbarHomeButton: function () {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      webview.src = this.DEFAULT_URL;
    },

    handleNavbarTabsButton: function () {
      this.tabsView().classList.toggle('visible');
    },

    handleNavbarOptionsButton: function (event) {
      const rtl = document.dir === 'rtl';
      const x = rtl ? 5 : window.innerWidth - 5;
      setTimeout(() => {
        ContextMenu.show(x, 90, [
          {
            name: 'New Tab',
            l10nId: 'contextMenu-newTab',
            icon: 'add',
            onclick: this.openNewTab.bind(this, false)
          },
          {
            name: 'New Private Tab',
            l10nId: 'contextMenu-newPrivateTab',
            icon: 'add',
            onclick: this.openNewTab.bind(this, true)
          },
          { type: 'separator' },
          {
            name: 'Library',
            l10nId: 'contextMenu-library',
            icon: 'browser-library',
            onclick: null
          },
          {
            name: 'History',
            l10nId: 'contextMenu-history',
            icon: 'browser-history',
            onclick: null
          },
          {
            name: 'Add-Ons',
            l10nId: 'contextMenu-addons',
            icon: 'browser-addons',
            onclick: null
          },
          {
            name: 'Settings',
            l10nId: 'contextMenu-settings',
            icon: 'settings',
            onclick: null
          }
        ]);
      }, 100);
    },

    handleTabsViewCloseButton: function () {
      this.tabsView().classList.remove('visible');
    },

    handleIpcMessage: function (event) {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      if (event.channel === 'scroll') {
        const scrollPosition = event.args[0].top;
        let progress = scrollPosition / 80;
        if (progress >= 1) {
          progress = 1;
        }
        webview.style.setProperty('--scroll-progress', progress);
      }
    },

    handleContextMenu: function (event) {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      ContextMenu.show(event.params.x, event.params.y, [
        {
          name: 'Back',
          l10nId: 'contextMenu-back',
          icon: 'browser-back',
          disabled: !webview.canGoBack(),
          onclick: () => {
            webview.focus();
            webview.goBack();
          }
        },
        {
          name: 'Forward',
          l10nId: 'contextMenu-forward',
          icon: 'browser-forward',
          disabled: !webview.canGoForward(),
          onclick: () => {
            webview.focus();
            webview.goForward();
          }
        },
        { type: 'separator' },
        {
          name: 'Copy',
          l10nId: 'contextMenu-copy',
          icon: 'textselection-copy',
          disabled: !event.params.editFlags.canCopy,
          onclick: () => {
            webview.focus();
            webview.copy();
          }
        },
        {
          name: 'Cut',
          l10nId: 'contextMenu-cut',
          icon: 'textselection-cut',
          disabled: !event.params.editFlags.canCut,
          onclick: () => {
            webview.focus();
            webview.cut();
          }
        },
        {
          name: 'Paste',
          l10nId: 'contextMenu-paste',
          icon: 'textselection-paste',
          disabled: !event.params.editFlags.canPaste,
          onclick: () => {
            webview.focus();
            webview.paste();
          }
        },
        {
          name: 'Select All',
          l10nId: 'contextMenu-selectAll',
          icon: 'textselection-selectall',
          disabled: !event.params.editFlags.canSelectAll,
          onclick: () => {
            webview.focus();
            webview.selectAll();
          }
        },
        { type: 'separator' },
        {
          name: 'Delete',
          l10nId: 'contextMenu-delete',
          icon: 'delete',
          disabled: !event.params.editFlags.canDelete,
          onclick: () => {
            webview.focus();
            webview.delete();
          }
        },
        { type: 'separator' },
        {
          name: 'Inspect Element',
          l10nId: 'contextMenu-inspect',
          icon: 'edit',
          onclick: () => {
            webview.focus();
            webview.openDevTools();
          }
        }
      ]);
    },

    handlePageFaviconUpdated: function (event) {
      const favicon = this.chrome.querySelector('.tablist .active .favicon');
      const gridFavicon = this.chrome.querySelector(
        '.tabs-view .active .favicon'
      );
      favicon.src = event.favicons[0];
      gridFavicon.src = event.favicons[0];
    },

    handlePageTitleUpdated: function (event) {
      const title = this.chrome.querySelector('.tablist .active .title');
      const gridTitle = this.chrome.querySelector('.tabs-view .active .title');
      title.textContent = event.title;
      gridTitle.textContent = event.title;
    },

    handleDidStartNavigation: function () {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      this.urlbarInput().value = webview.getURL();

      if (webview.getURL() === this.DEFAULT_URL) {
        this.urlbarDisplayUrl().innerText = navigator.mozL10n.get('urlbar');
      } else {
        const url = new URL(webview.getURL());
        this.urlbarDisplayUrl().innerHTML = `
          <div class="ignored">${url.protocol}//</div>
          <div class="highlighted">${url.host}</div>
          <div class="ignored">${url.pathname}</div>
          <div class="ignored">${url.search}</div>
          <div class="ignored">${url.hash}</div>
        `;
      }
    },

    handleThemeColorUpdated: function (event) {
      const webview = this.chrome.querySelector(
        '.browser-container .browser.active'
      );
      const color = event.themeColor;
      if (color) {
        webview.dataset.themeColor = (color + 'C0').toLowerCase();
        this.chrome.parentElement.style.setProperty(
          '--theme-color',
          color
        );
        this.toolbar().style.setProperty(
          '--theme-color',
          (color + 'C0').toLowerCase()
        );

        // Calculate the luminance of the color
        const luminance = this.calculateLuminance(color);

        // If the color is light (luminance > 0.5), add 'light' class to the status bar
        if (luminance > 0.5) {
          this.chrome.classList.add('light');
          this.chrome.parentElement.classList.add('light');
          if (this.statusbar) {
            this.statusbar.classList.add('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('light');
          }
          this.chrome.classList.remove('dark');
          this.chrome.parentElement.classList.remove('dark');
          if (this.statusbar) {
            this.statusbar.classList.remove('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('dark');
          }
        } else {
          // Otherwise, remove 'light' class
          this.chrome.classList.remove('light');
          this.chrome.parentElement.classList.remove('light');
          if (this.statusbar) {
            this.statusbar.classList.remove('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('light');
          }
          this.chrome.classList.add('dark');
          this.chrome.parentElement.classList.add('dark');
          if (this.statusbar) {
            this.statusbar.classList.add('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('dark');
          }
        }
      } else {
        webview.dataset.themeColor = null;
        this.chrome.parentElement.style.setProperty(
          '--theme-color',
          null
        );
        this.toolbar().style.setProperty(
          '--theme-color',
          null
        );

        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          this.chrome.classList.add('light');
          this.chrome.parentElement.classList.add('light');
          if (this.statusbar) {
            this.statusbar.classList.add('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('light');
          }
          this.chrome.classList.remove('dark');
          this.chrome.parentElement.classList.remove('dark');
          if (this.statusbar) {
            this.statusbar.classList.remove('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('dark');
          }
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Otherwise, remove 'light' class
          this.chrome.classList.remove('light');
          this.chrome.parentElement.classList.remove('light');
          if (this.statusbar) {
            this.statusbar.classList.remove('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('light');
          }
          this.chrome.classList.add('dark');
          this.chrome.parentElement.classList.add('dark');
          if (this.statusbar) {
            this.statusbar.classList.add('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('dark');
          }
        }
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

    openFtuDialog: function () {
      this.ftuDialog().classList.add('visible');
      this.ftuDialog().onclick = () => {
        if (process.platform === 'win32') {
          new Audio('file://C:/Windows/Media/Windows Background.wav').play();
        } else {
          new Audio('/resources/sounds/exclamation.wav').play();
        }
        this.ftuDialog().classList.add('alert');
        this.ftuDialog().addEventListener('transitionend', () => {
          this.ftuDialog().classList.remove('alert');
        });
      };

      this.ftuDialog().querySelector('.container').onclick = (event) => {
        event.stopPropagation();
      };

      const pageButtons = this.ftuDialog().querySelectorAll('[data-page-id]');
      pageButtons.forEach((button) => {
        button.addEventListener('click', () =>
          this.handlePageButtonClick(button)
        );
      });

      const panels = this.ftuDialog().querySelectorAll('.page');
      panels.forEach((panel, index) => {
        panel.dataset.index = index;
        panel.classList.add('next');
      });

      const doneButton = this.ftuDialog().querySelector('.done-button');
      doneButton.onclick = () => {
        this.ftuDialog().classList.remove('visible');
      };

      const accentColorRed = this.ftuDialog().querySelector(
        '.accent-colors .red'
      );
      const accentColorYellow = this.ftuDialog().querySelector(
        '.accent-colors .yellow'
      );
      const accentColorGreen = this.ftuDialog().querySelector(
        '.accent-colors .green'
      );
      const accentColorBlue = this.ftuDialog().querySelector(
        '.accent-colors .blue'
      );
      const accentColorPurple = this.ftuDialog().querySelector(
        '.accent-colors .purple'
      );

      accentColorRed.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 192);
        document.scrollingElement.style.setProperty('--accent-color-g', 0);
        document.scrollingElement.style.setProperty('--accent-color-b', 64);
        _session.settings.setValue('homescreen.accent_color.rgb', {
          r: 192,
          g: 0,
          b: 64
        });
      };
      accentColorYellow.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 255);
        document.scrollingElement.style.setProperty('--accent-color-g', 192);
        document.scrollingElement.style.setProperty('--accent-color-b', 0);
        _session.settings.setValue('homescreen.accent_color.rgb', {
          r: 255,
          g: 192,
          b: 0
        });
      };
      accentColorGreen.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 64);
        document.scrollingElement.style.setProperty('--accent-color-g', 160);
        document.scrollingElement.style.setProperty('--accent-color-b', 96);
        _session.settings.setValue('homescreen.accent_color.rgb', {
          r: 64,
          g: 160,
          b: 96
        });
      };
      accentColorBlue.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', null);
        document.scrollingElement.style.setProperty('--accent-color-g', null);
        document.scrollingElement.style.setProperty('--accent-color-b', null);
        _session.settings.setValue('homescreen.accent_color.rgb', {
          r: null,
          g: null,
          b: null
        });
      };
      accentColorPurple.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 128);
        document.scrollingElement.style.setProperty('--accent-color-g', 48);
        document.scrollingElement.style.setProperty('--accent-color-b', 160);
        _session.settings.setValue('homescreen.accent_color.rgb', {
          r: 128,
          g: 48,
          b: 160
        });
      };
    },

    handlePageButtonClick: function (button) {
      const id = button.dataset.pageId;
      const selectedPanel = this.ftuDialog().querySelector('.page.visible');

      this.togglePanelVisibility(selectedPanel, id);
    },

    togglePanelVisibility: function (selectedPanel, targetPanelId) {
      const targetPanel = this.ftuDialog().querySelector(`.${targetPanelId}`);

      if (selectedPanel) {
        selectedPanel.classList.toggle('visible');
        selectedPanel.classList.toggle(
          'previous',
          selectedPanel.dataset.index <= targetPanel.dataset.index
        );
        selectedPanel.classList.toggle(
          'next',
          selectedPanel.dataset.index >= targetPanel.dataset.index
        );
      }

      targetPanel.classList.toggle('visible');
      targetPanel.classList.toggle(
        'previous',
        selectedPanel.dataset.index <= targetPanel.dataset.index
      );
      targetPanel.classList.toggle(
        'next',
        selectedPanel.dataset.index >= targetPanel.dataset.index
      );
    }
  };

  exports.Browser = Browser;
})(window);
