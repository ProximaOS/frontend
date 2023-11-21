!(function (exports) {
  'use strict';

  const Browser = {
    _id: 0,

    chrome: null,
    screen: document.getElementById('screen'),
    statusbar: document.getElementById('statusbar'),
    softwareButtons: document.getElementById('software-buttons'),
    bottomPanel: document.getElementById('bottom-panel'),

    DEFAULT_URL: 'https://www.duckduckgo.com',
    SEARCH_ENGINE: 0,

    searchIcon: 'https://www.google.com/favicon.ico',
    searchUrl: 'https://www.google.com/search?q={searchTerms}',
    suggestUrl: 'https://www.google.com/complete/search?output=chrome&q={searchTerms}',

    lastScroll: 0,
    currentScroll: 0,

    ADDON_ICON_SIZE: 20 * window.devicePixelRatio,

    toolbar: function () {
      return this.chrome().querySelector('.toolbar');
    },

    tablistHolder: function () {
      return this.chrome().querySelector('.tablist-holder');
    },

    tablist: function () {
      return this.chrome().querySelector('.tablist');
    },

    profileButton: function () {
      return this.chrome().querySelector('.profile-button');
    },

    sideTabsButton: function () {
      return this.chrome().querySelector('.side-tabs-button');
    },

    addButton: function () {
      return this.chrome().querySelector('.add-button');
    },

    navbarBackButton: function () {
      return this.chrome().querySelector('.navbar-back-button');
    },

    navbarForwardButton: function () {
      return this.chrome().querySelector('.navbar-forward-button');
    },

    navbarReloadButton: function () {
      return this.chrome().querySelector('.navbar-reload-button');
    },

    navbarHomeButton: function () {
      return this.chrome().querySelector('.navbar-home-button');
    },

    navbarTabsButton: function () {
      return this.chrome().querySelector('.navbar-tabs-button');
    },

    navbarDownloadsButton: function () {
      return this.chrome().querySelector('.navbar-downloads-button');
    },

    navbarLibraryButton: function () {
      return this.chrome().querySelector('.navbar-library-button');
    },

    navbarAddonsButton: function () {
      return this.chrome().querySelector('.navbar-addons-button');
    },

    navbarOptionsButton: function () {
      return this.chrome().querySelector('.navbar-options-button');
    },

    urlbar: function () {
      return this.chrome().querySelector('.urlbar');
    },

    urlbarInput: function () {
      return this.chrome().querySelector('.urlbar-input');
    },

    urlbarDisplayUrl: function () {
      return this.chrome().querySelector('.urlbar-display-url');
    },

    urlbarSSLButton: function () {
      return this.chrome().querySelector('.urlbar-ssl-button');
    },

    suggestions: function () {
      return this.chrome().querySelector('.suggestions');
    },

    addonsButtons: function () {
      return this.chrome().querySelector('.addons-buttons');
    },

    browserContainer: function () {
      return this.chrome().querySelector('.browser-container');
    },

    tabsView: function () {
      return this.chrome().querySelector('.tabs-view');
    },

    tabsViewCloseButton: function () {
      return this.chrome().querySelector('.tabs-view-close-button');
    },

    tabsViewAddButton: function () {
      return this.chrome().querySelector('.tabs-view-add-button');
    },

    tabsViewList: function () {
      return this.chrome().querySelector('.tabs-view .grid');
    },

    dropdown: function () {
      return this.chrome().querySelector('.dropdown');
    },

    ftuDialog: function () {
      return this.chrome().querySelector('.ftu-dialog');
    },

    tablistPreview: function () {
      return this.chrome().querySelector('.tablist-preview');
    },

    tablistPreviewImage: function () {
      return this.chrome().querySelector('.tablist-preview .preview-image');
    },

    tablistPreviewTitle: function () {
      return this.chrome().querySelector('.tablist-preview .title');
    },

    tablistPreviewIcon: function () {
      return this.chrome().querySelector('.tablist-preview .icon');
    },

    tablistPreviewOrigin: function () {
      return this.chrome().querySelector('.tablist-preview .origin');
    },

    tablistPreviewMediaNotice: function () {
      return this.chrome().querySelector('.tablist-preview .media-notice');
    },

    tablistPreviewHibernationNotice: function () {
      return this.chrome().querySelector('.tablist-preview .hibernation-notice');
    },

    addonDropdown: function () {
      return this.chrome().querySelector('.addon-dropdown');
    },

    addonDropdownBrowser: function () {
      return this.chrome().querySelector('.addon-dropdown .browser');
    },

    init: async function (chromeElement, url, isChromeEnabled = true) {
      this.chrome = function () {
        if (chromeElement) {
          return chromeElement;
        }

        if ('AppWindow' in window) {
          return document.querySelector('.appframe.active .chrome');
        }
      };

      const response = await fetch('http://system.localhost:8081/elements/chrome_interface.html');
      const htmlContent = await response.text();

      this.chrome().innerHTML = htmlContent;

      if (isChromeEnabled) {
        this.chrome().classList.add('visible');
        this.chrome().parentElement.classList.add('chrome-visible');

        Settings.getValue('ftu.browser.enabled').then((value) => {
          if (value) {
            this.openFtuDialog();
          }
        });
      }

      Settings.getValue('general.chrome.position').then((data) => {
        this.chrome().classList.add(data);
      });
      Settings.addObserver('general.chrome.position', (data) => {
        this.chrome().classList.remove('top');
        this.chrome().classList.remove('bottom');
        this.chrome().classList.add(data);
      });

      if (this.statusbar) {
        this.statusbar.classList.remove('light');
        this.statusbar.classList.remove('dark');
      }
      if (this.softwareButtons) {
        this.softwareButtons.classList.remove('light');
        this.softwareButtons.classList.remove('dark');
      }
      if (this.bottomPanel) {
        this.bottomPanel.classList.remove('light');
        this.bottomPanel.classList.remove('dark');
      }

      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.chrome().classList.add('dark');
        this.chrome().parentElement.classList.add('dark');
      } else {
        this.chrome().classList.add('light');
        this.chrome().parentElement.classList.add('light');
      }

      this.chrome().dataset.id = 0;
      this.DEFAULT_URL = url;
      CardPanel.init();
      this.openNewTab(false, url);

      const avatarImage = this.profileButton().querySelector('.avatar');
      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          this.profileButton().classList.add('logged-in');
          OrchidServices.getWithUpdate(`profile/${await OrchidServices.userId()}`, function (data) {
            avatarImage.src = data.profile_picture;
          });
        }
      }

      if (this.statusbar) {
        this.statusbar.addEventListener('dblclick', this.handleStatusbarDoubleClick.bind(this));
      }

      this.tablistHolder().addEventListener('contextmenu', this.handleTablistHolderContextMenu.bind(this));
      this.sideTabsButton().addEventListener('click', this.handleSideTabsButton.bind(this));
      this.addButton().addEventListener('click', this.openNewTab.bind(this, false));
      this.urlbarInput().addEventListener('keydown', this.handleUrlbarInputKeydown.bind(this));
      this.navbarBackButton().addEventListener('click', this.handleNavbarBackButton.bind(this));
      this.navbarForwardButton().addEventListener('click', this.handleNavbarForwardButton.bind(this));
      this.navbarReloadButton().addEventListener('click', this.handleNavbarReloadButton.bind(this));
      this.navbarHomeButton().addEventListener('click', this.handleNavbarHomeButton.bind(this));
      this.navbarTabsButton().addEventListener('click', this.handleNavbarTabsButton.bind(this));
      this.navbarDownloadsButton().addEventListener('click', this.handleNavbarDownloadsButton.bind(this));
      this.navbarLibraryButton().addEventListener('click', this.handleNavbarLibraryButton.bind(this));
      this.navbarAddonsButton().addEventListener('click', this.handleNavbarAddonsButton.bind(this));
      this.navbarOptionsButton().addEventListener('click', this.handleNavbarOptionsButton.bind(this));
      this.urlbarSSLButton().addEventListener('click', this.handleUrlbarSSLButton.bind(this));
      this.tabsViewCloseButton().addEventListener('click', this.handleTabsViewCloseButton.bind(this));
      this.tabsViewAddButton().addEventListener('click', this.openNewTab.bind(this));

      document.onclick = () => {
        this.addonDropdown().classList.remove('visible');
      };

      this.addonDropdownBrowser().addEventListener('dom-ready', () => {
        const webContents = webview.getWebContents();
        const scrollHeight = webContents.executeJavaScript('document.body.scrollHeight');
        this.addonDropdown().style.height = scrollHeight + 'px';
      });

      const apps = await AppsManager.getAll();
      const addons = apps.filter(app => app.manifest.role === 'addon');
      for (let index = 0; index < addons.length; index++) {
        const addon = addons[index];

        const addonButton = document.createElement('button');
        addonButton.title = addon.manifest.name;
        this.addonsButtons().appendChild(addonButton);

        addonButton.onclick = () => {
          const chromeBox = this.chrome().getBoundingClientRect();
          const addonDropdownBox = this.addonDropdown().getBoundingClientRect();
          const addonButtonBox = addonButton.getBoundingClientRect();
          let x = addonButtonBox.left - chromeBox.left;
          const y = (addonButtonBox.top + addonButtonBox.height) - chromeBox.top;

          if (x > (window.innerWidth / 2)) {
            x = (addonButtonBox.left - addonDropdownBox.width - chromeBox.left) + addonButtonBox.width;
          }

          this.addonDropdown().style.left = x + 'px';
          this.addonDropdown().style.top = y + 'px';
          setTimeout(() => {
            this.addonDropdown().classList.add('visible');
          }, 16);

          const url = new URL(addon.manifestUrl['en-US']);
          this.addonDropdownBrowser().src = url.origin + addon.dropdown.launch_url;
        };

        const addonIcon = document.createElement('img');
        addonButton.appendChild(addonIcon);

        const entries = Object.entries(addon.manifest.dropdown.icons);
        for (let index = 0; index < entries.length; index++) {
          const entry = entries[index];

          if (entry[0] <= this.ADDON_ICON_SIZE) {
            continue;
          }
          const url = new URL(addon.manifestUrl['en-US']);
          addonIcon.src = url.origin + '/' + entry[1];
        }
      }
    },

    handleStatusbarDoubleClick: function () {
      const webview = this.chrome().querySelector('.browser-container .browser-view.active > .browser');
      webview.executeJavaScript(`
        const panelContent = document.querySelector('[role="panel"].visible > .content');
        if (panelContent) {
          panelContent.scroll({
            left: 0,
            top: 0,
            behavior: 'smooth'
          });
        } else {
          document.scrollingElement.scroll({
            left: 0,
            top: 0,
            behavior: 'smooth'
          });
        }
      `);
    },

    handleTablistHolderContextMenu: function (event) {
      const appId = this.chrome().parentElement.id;

      const x = event.clientX;
      const y = event.clientY;

      const menu = [
        {
          name: 'Close',
          l10nId: 'browserMenu-close',
          icon: 'windowmanager-close',
          onclick: () => AppWindow.close(appId)
        },
        {
          name: 'Maximize',
          l10nId: 'browserMenu-maximize',
          icon: 'windowmanager-maximize',
          onclick: () => this.openNewTab(true)
        },
        {
          name: 'Minimize',
          l10nId: 'browserMenu-minimize',
          icon: 'windowmanager-minimize',
          onclick: () => this.openNewTab(true)
        },
        { type: 'separator' },
        {
          name: 'New Tab',
          l10nId: 'browserMenu-newTab',
          icon: 'add',
          onclick: () => this.openNewTab(false)
        },
        {
          name: 'New Private Tab',
          l10nId: 'browserMenu-newPrivateTab',
          icon: 'privacy',
          onclick: () => this.openNewTab(true)
        },
        { type: 'separator' },
        {
          name: 'Toggle Side Tabs',
          l10nId: 'browserMenu-sideTabs',
          icon: 'side-tabs',
          onclick: () => this.chrome().classList.toggle('side-tabs')
        },
        { type: 'separator' },
        {
          name: 'Customize Toolbar',
          l10nId: 'browserMenu-customizeToolbar',
          icon: 'brush-size',
          onclick: () => this.openNewTab(false, 'orchid://customize.html')
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      setTimeout(() => {
        ContextMenu.show(x, y, menu);
      }, 16);
    },

    handleSideTabsButton: function () {
      this.chrome().classList.toggle('side-tabs');
    },

    openNewTab: function (isPrivate = false, url) {
      this.chrome().dataset.id++;
      this.navbarTabsButton().dataset.amount = this.chrome().dataset.id;

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
      favicons.appendChild(loadingIcon);

      const title = document.createElement('span');
      title.classList.add('title');
      tab.appendChild(title);

      const muteButton = document.createElement('button');
      muteButton.classList.add('mute-button');
      muteButton.dataset.icon = 'audio';
      tab.appendChild(muteButton);

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

      const browserView = document.createElement('div');
      browserView.classList.add('browser-view');
      this.browserContainer().appendChild(browserView);

      const webview = document.createElement('webview');
      setTimeout(() => {
        webview.src = url || this.DEFAULT_URL;
      }, 300);
      webview.classList.add('browser');
      browserView.appendChild(webview);

      function updateUserAgent(value) {
        switch (value) {
          case 'android':
            webview.useragent = navigator.userAgent.replace(/\((.*)\)/i, '(Linux; Android 14)');
            break;

          case 'desktop':
            webview.useragent = navigator.userAgent.replace(/\((.*)\)/i, '(X11; Linux x86_64)').replace('Mobile ', '');
            break;

          case 'default':
          default:
            webview.useragent = navigator.userAgent;
            break;
        }
      }
      Settings.getValue('general.chrome.user_agent').then(updateUserAgent);
      Settings.addObserver('general.chrome.user_agent', updateUserAgent);

      if (isPrivate) {
        webview.partition = 'private';
        webview.classList.add('private');
      }

      const devToolsView = document.createElement('webview');
      devToolsView.classList.add('devtools');
      devToolsView.nodeintegration = true;
      devToolsView.nodeintegrationinsubframes = true;
      devToolsView.preload = `file://${Environment.dirName().replaceAll('\\', '/')}/preload.js`;
      browserView.appendChild(devToolsView);

      webview.addEventListener('ipc-message', this.handleIpcMessage.bind(this));
      webview.addEventListener('context-menu', this.handleContextMenu.bind(this));
      webview.addEventListener('page-favicon-updated', this.handlePageFaviconUpdated.bind(this));
      webview.addEventListener('page-title-updated', this.handlePageTitleUpdated.bind(this));
      webview.addEventListener('did-start-navigation', this.handleDidStartNavigation.bind(this));
      webview.addEventListener('did-change-theme-color', this.handleThemeColorUpdated.bind(this));

      webview.addEventListener('did-start-loading', () => {
        this.navbarReloadButton().classList.add('stop');
        favicons.classList.add('loading');
        favicons.classList.remove('dom-loading');
      });

      webview.addEventListener('dom-ready', () => {
        favicons.classList.add('loading');
        favicons.classList.add('dom-loading');
      });

      webview.addEventListener('did-stop-loading', () => {
        this.navbarReloadButton().classList.remove('stop');
        favicons.classList.remove('loading');
        favicons.classList.remove('dom-loading');

        const splashElement = this.chrome().parentElement.querySelector('.splashscreen');
        if (splashElement) {
          splashElement.classList.add('hidden');
        }
      });

      webview.addEventListener('enter-html-full-screen', (event) => {
        event.preventDefault();
        this.chrome().parentElement.classList.add('fullscreen');
      });

      webview.addEventListener('leave-html-full-screen', (event) => {
        event.preventDefault();
        this.chrome().parentElement.classList.remove('fullscreen');
      });

      webview.addEventListener('close', () => {
        tab.remove();
        gridTab.remove();
        browserView.remove();

        if (this.browserContainer().children.length === 0) {
          if ('AppWindow' in window) {
            AppWindow.close(this.chrome().parentElement.id);
          } else {
            window.close();
          }
        }
      });

      ['did-start-loading', 'did-start-navigation', 'did-stop-loading', 'dom-ready'].forEach((eventType) => {
        webview.addEventListener(eventType, () => {
          if (!isPrivate) {
            DisplayManager.screenshot(webview.getWebContentsId()).then((data) => {
              gridPreview.src = data;
            });
          }
        });
      });

      ['media-started-playing', 'media-paused'].forEach((eventType) => {
        webview.addEventListener(eventType, () => {
          if (webview.isCurrentlyAudible()) {
            if (webview.isAudioMuted()) {
              muteButton.dataset.icon = 'audio-muted';
            } else {
              muteButton.dataset.icon = 'audio';
            }
            muteButton.style.display = 'block';
          } else {
            this.timeoutID = setTimeout(() => {
              muteButton.style.display = 'none';
            }, 1000);
          }
        });
      });

      const focus = () => {
        const tabs = this.chrome().querySelectorAll('.tablist li');
        for (let index = 0; index < tabs.length; index++) {
          const tab = tabs[index];
          tab.classList.remove('active');
        }

        const gridTabs = this.chrome().querySelectorAll('.tabs-view .grid .tab');
        for (let index = 0; index < gridTabs.length; index++) {
          const gridTab = gridTabs[index];
          gridTab.classList.remove('active');
        }

        const browserViews = this.chrome().querySelectorAll('.browser-container .browser-view');
        for (let index = 0; index < browserViews.length; index++) {
          const browserView = browserViews[index];
          browserView.classList.remove('active');
        }

        tab.classList.add('active');
        gridTab.classList.add('active');
        browserView.classList.add('active');
      };

      focus();

      tab.addEventListener('click', focus.bind(this));
      gridTab.addEventListener('click', focus.bind(this));

      closeButton.addEventListener('click', (event) => {
        event.stopPropagation();

        this.chrome().dataset.id--;
        this.navbarTabsButton().dataset.amount = this.chrome().dataset.id;

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
        browserView.remove();
      });

      muteButton.addEventListener('click', (event) => {
        event.stopPropagation();

        if (webview.isAudioMuted()) {
          webview.setAudioMuted(false);
          muteButton.dataset.icon = 'audio';
        } else {
          webview.setAudioMuted(true);
          muteButton.dataset.icon = 'audio-muted';
        }
      });

      gridCloseButton.addEventListener('click', (event) => {
        event.stopPropagation();

        this.chrome().dataset.id--;
        this.navbarTabsButton().dataset.amount = this.chrome().dataset.id;

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
        browserView.remove();
      });

      tab.addEventListener('mouseover', () => {
        const chromeBox = this.chrome().getBoundingClientRect();
        const tabBox = tab.getBoundingClientRect();
        const x = tabBox.left - chromeBox.left;
        const y = (tabBox.top + tabBox.height + 5) - chromeBox.top;

        this.tablistPreview().style.left = x + 'px';
        this.tablistPreview().style.top = y + 'px';

        this.tablistPreview().classList.add('visible');
        DisplayManager.screenshot(webview.getWebContentsId()).then((data) => {
          this.tablistPreviewImage().src = data;
        });
        this.tablistPreviewTitle().textContent = webview.getTitle();
        this.tablistPreviewIcon().src = favicon.src;
        const url = new URL(webview.getURL());
        this.tablistPreviewOrigin().textContent = url.origin;
      });

      tab.addEventListener('mouseleave', () => {
        this.tablistPreview().classList.remove('visible');
      });
    },

    updateSuggestions: function () {
      const inputText = this.urlbarInput().value;

      fetch(this.suggestUrl.replace('{searchTerms}', encodeURI(inputText))).then((suggestionData) => {
        suggestionData.json().then((data) => {
          this.suggestions().innerHTML = '';
          for (let index = 0; index < data[1].length; index++) {
            const item = data[1][index];

            const suggestion = document.createElement('div');
            suggestion.classList.add('suggestion');
            suggestion.addEventListener('click', () => {
              const webview = this.chrome().querySelector('.browser-container .browser-view.active > .browser');
              webview.src = this.searchUrl.replace('{searchTerms}', encodeURI(item));
            });
            this.suggestions().appendChild(suggestion);

            const favicon = document.createElement('img');
            favicon.classList.add('favicon');
            favicon.src = this.searchIcon;
            suggestion.appendChild(favicon);

            const label = document.createElement('div');
            label.classList.add('label');
            label.textContent = item;
            suggestion.appendChild(label);

            const notice = document.createElement('div');
            notice.classList.add('notice');
            notice.textContent = 'Search this with Google';
            label.appendChild(notice);
          }
        });
      });
    },

    handleUrlbarInputKeydown: function (event) {
      function checkURL(url) {
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)*[\w-]+(:\d+)?(\/[\w-./?%&=]*)?$/;

        const isURL = urlPattern.test(url);
        const hasProtocol = /^(https?:\/\/)/.test(url);

        return {
          isURL,
          hasProtocol
        };
      }

      if (event.key === 'Enter') {
        const webview = this.chrome().querySelector('.browser-container .browser-view.active > .browser');
        const input = event.target.value;
        if (checkURL(input).isURL && checkURL(input).hasProtocol) {
          webview.src = input;
        } else if (checkURL(input).isURL && !checkURL(input).hasProtocol) {
          webview.src = `https://${input}`;
        } else {
          webview.src = this.searchUrl.replace('{searchTerms}', encodeURI(input));
        }
      } else {
        this.updateSuggestions();
      }
    },

    handleNavbarBackButton: function () {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');
      if (webview.canGoBack()) {
        webview.goBack();
      }
    },

    handleNavbarForwardButton: function () {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');
      if (webview.canGoForward()) {
        webview.goForward();
      }
    },

    handleNavbarReloadButton: function () {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');
      webview.reload();
    },

    handleNavbarHomeButton: function () {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');
      webview.src = this.DEFAULT_URL;
    },

    handleNavbarTabsButton: function () {
      this.chrome().classList.toggle('tabs-view-visible');
      this.tabsView().classList.toggle('visible');
    },

    handleNavbarDownloadsButton: function (event) {
      this.openDropdown('downloads');
    },

    handleNavbarLibraryButton: function (event) {
      this.openDropdown('library');
    },

    handleNavbarAddonsButton: function (event) {
      ContextMenu({});
    },

    handleNavbarOptionsButton: async function (event) {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');

      const box = this.navbarOptionsButton().getBoundingClientRect();
      const rtl = document.dir === 'rtl';

      const x = rtl ? box.left : box.left + box.width - 25;
      const y = box.top > window.innerHeight / 2 ? box.top : box.top + box.height;

      const menu = [
        {
          type: 'nav',
          buttons: [
            {
              l10nId: 'contextMenu-back',
              icon: 'arrow-back',
              disabled: !webview.canGoBack(),
              onclick: () => {
                webview.focus();
                webview.goBack();
              }
            },
            {
              l10nId: 'contextMenu-forward',
              icon: 'arrow-forward',
              disabled: !webview.canGoForward(),
              onclick: () => {
                webview.focus();
                webview.goForward();
              }
            },
            {
              l10nId: 'contextMenu-reload',
              icon: 'reload',
              onclick: () => {
                webview.focus();
                webview.reload();
              }
            },
            {
              l10nId: 'contextMenu-bookmark',
              icon: (await Settings.getValue('bookmarks', 'bookmarks.json')).filter((item) => item.url === webview.getURL()) ? 'bookmarked' : 'bookmark',
              onclick: this.requestBookmark.bind(this)
            }
          ]
        },
        {
          type: 'separator',
          hidden: (await Settings.getValue('general.chrome.position')) !== 'bottom'
        },
        {
          name: 'Move Chrome Up',
          l10nId: 'dropdown-moveChromeUp',
          icon: 'browser-moveup',
          hidden: (await Settings.getValue('general.chrome.position')) !== 'bottom',
          onclick: () => Settings.setValue('general.chrome.position', 'top')
        },
        { type: 'separator' },
        {
          name: 'History',
          l10nId: 'dropdown-history',
          icon: 'history',
          onclick: () => this.openNewTab(false, 'orchid://history/')
        },
        {
          name: 'Add-Ons',
          l10nId: 'dropdown-addons',
          icon: 'addons',
          onclick: () => this.openNewTab(false, 'orchid://addons/')
        },
        {
          name: 'Webapps',
          l10nId: 'dropdown-webapps',
          icon: 'apps',
          onclick: () => this.openNewTab(false, 'orchid://webapps/')
        },
        { type: 'separator' },
        {
          name: 'Reader Mode',
          l10nId: 'dropdown-readerMode',
          icon: 'reader-mode',
          onclick: () => {
            if (webview.getURL().startsWith('orchidreader://')) {
              webview.url = webview.getURL().substring('orchidreader://?content='.length);
            } else {
              webview.url = `orchidreader://?content=${webview.getURL()}`;
            }
          }
        },
        {
          name: 'Translate',
          l10nId: 'dropdown-translate',
          icon: 'translate',
          onclick: () => {}
        },
        { type: 'separator' },
        {
          type: 'nav',
          buttons: [
            {
              l10nId: 'dropdown-zoomOut',
              icon: 'remove',
              onclick: () => {
                const zoom = webview.getZoomFactor();
                const targetZoom = Math.min(5, Math.max(0.3, zoom - 0.2));
                const duration = 500; // 500ms transition time

                const startTime = performance.now();
                function animateZoom() {
                  const currentTime = performance.now();
                  const progress = Math.min((currentTime - startTime) / duration, 1);

                  const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
                  const newZoom = zoom + (targetZoom - zoom) * easedProgress;
                  webview.setZoomFactor(newZoom);

                  if (progress < 1) {
                    requestAnimationFrame(animateZoom);
                  }
                }

                animateZoom();
              }
            },
            {
              l10nId: 'dropdown-resetZoom',
              l10nArgs: {
                value: Math.round(webview.getZoomFactor() * 100)
              },
              onclick: () => {
                const zoom = webview.getZoomFactor();
                const targetZoom = 1;
                const duration = 500; // 500ms transition time

                const startTime = performance.now();
                function animateZoom() {
                  const currentTime = performance.now();
                  const progress = Math.min((currentTime - startTime) / duration, 1);

                  const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
                  const newZoom = zoom + (targetZoom - zoom) * easedProgress;
                  webview.setZoomFactor(newZoom);

                  if (progress < 1) {
                    requestAnimationFrame(animateZoom);
                  }
                }

                animateZoom();
              }
            },
            {
              l10nId: 'dropdown-zoomIn',
              icon: 'add',
              onclick: () => {
                const zoom = webview.getZoomFactor();
                const targetZoom = Math.min(5, Math.max(0.3, zoom + 0.2));
                const duration = 500; // 500ms transition time

                const startTime = performance.now();
                function animateZoom() {
                  const currentTime = performance.now();
                  const progress = Math.min((currentTime - startTime) / duration, 1);

                  const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
                  const newZoom = zoom + (targetZoom - zoom) * easedProgress;
                  webview.setZoomFactor(newZoom);

                  if (progress < 1) {
                    requestAnimationFrame(animateZoom);
                  }
                }

                animateZoom();
              }
            }
          ]
        },
        { type: 'separator' },
        {
          name: 'Settings',
          l10nId: 'dropdown-settings',
          icon: 'settings',
          onclick: () => this.openNewTab(false, 'orchid://settings/')
        },
        {
          name: 'Quit',
          l10nId: 'dropdown-quit',
          icon: 'power',
          onclick: () => {
            if ('AppWindow' in window) {
              AppWindow.close(this.chrome().parentElement.id);
            } else {
              window.close();
            }
          }
        },
        {
          type: 'separator',
          hidden: (await Settings.getValue('general.chrome.position')) !== 'top'
        },
        {
          name: 'Move Chrome Down',
          l10nId: 'dropdown-moveChromeDown',
          icon: 'browser-movedown',
          hidden: (await Settings.getValue('general.chrome.position')) !== 'top',
          onclick: () => Settings.setValue('general.chrome.position', 'bottom')
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      setTimeout(() => {
        ContextMenu.show(x, y, menu, this.navbarOptionsButton());
      }, 16);
    },

    requestBookmark: function () {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');

      ModalDialog.showPrompt(navigator.mozL10n.get('bookmark'), navigator.mozL10n.get('bookmark-detail'), (value) => {
        const newItem = {
          name: value,
          url: webview.getURL(),
          timeCreated: Date.now()
        };

        Settings.getValue('bookmarks', 'bookmarks.json').then((value) => {
          if (array.some((item) => item.url === newItem.url)) {
            value.push(newItem);
            Settings.setValue('bookmarks', value, 'bookmarks.json');
          }
        });
      });
    },

    handleUrlbarSSLButton: async function (event) {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');

      const box = this.urlbarSSLButton().getBoundingClientRect();
      const rtl = document.dir === 'rtl';

      const x = rtl ? box.left : box.left + box.width - 25;
      const y = box.top > window.innerHeight / 2 ? box.top : box.top + box.height;

      const menu = [
        {
          name: webview.getURL().startsWith('https') ? 'This webpage is secure.' : 'This webpage is unsecure.',
          disabled: true
        },
        { type: 'separator' },
        {
          name: 'User Agent',
          disabled: true
        },
        {
          name: 'Default',
          l10nId: 'ssl-userAgent-default',
          icon: (await Settings.getValue('general.chrome.user_agent')) === 'default' ? 'tick' : ' ',
          onclick: () => Settings.setValue('general.chrome.user_agent', 'default')
        },
        {
          name: 'Android (Phone)',
          l10nId: 'ssl-userAgent-android',
          icon: (await Settings.getValue('general.chrome.user_agent')) === 'android' ? 'tick' : ' ',
          onclick: () => Settings.setValue('general.chrome.user_agent', 'android')
        },
        {
          name: 'Desktop',
          l10nId: 'ssl-userAgent-desktop',
          icon: (await Settings.getValue('general.chrome.user_agent')) === 'desktop' ? 'tick' : ' ',
          onclick: () => Settings.setValue('general.chrome.user_agent', 'desktop')
        },
        { type: 'separator' },
        {
          name: 'Delete Storage & Cookies',
          l10nId: 'ssl-forgetWebpage',
          icon: 'delete',
          onclick: () => {}
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      setTimeout(() => {
        ContextMenu.show(x, y, menu, this.urlbarSSLButton());
      }, 16);
    },

    handleTabsViewCloseButton: function () {
      this.chrome().classList.remove('tabs-view-visible');
      this.tabsView().classList.remove('visible');
    },

    handleIpcMessage: function (event) {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');

      const scrollPosition = event.args[0].top;
      let progress = scrollPosition / 80;

      switch (event.channel) {
        case 'scroll':
          progress = Math.min(1, progress);
          webview.style.setProperty('--scroll-progress', progress);

          if (!this.chrome().classList.contains('chrome-visible')) {
            return;
          }

          this.currentScroll = event.args[0].top;
          if (this.currentScroll > this.lastScroll + 50) {
            this.chrome().classList.remove('visible');
            this.lastScroll = event.args[0].top;
          } else if (this.currentScroll < this.lastScroll - 50) {
            this.chrome().classList.add('visible');
            this.lastScroll = event.args[0].top;
          }
          break;

        default:
          break;
      }
    },

    handleContextMenu: function (event) {
      const browserView = this.browserContainer().querySelector('.browser-view.active');
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');
      const devToolsView = this.browserContainer().querySelector('.browser-view.active > .devtools');

      const itemsBefore = [
        {
          type: 'nav',
          buttons: [
            {
              l10nId: 'contextMenu-back',
              icon: 'arrow-back',
              disabled: !webview.canGoBack(),
              onclick: () => {
                webview.focus();
                webview.goBack();
              }
            },
            {
              l10nId: 'contextMenu-forward',
              icon: 'arrow-forward',
              disabled: !webview.canGoForward(),
              onclick: () => {
                webview.focus();
                webview.goForward();
              }
            },
            {
              l10nId: 'contextMenu-reload',
              icon: 'reload',
              onclick: () => {
                webview.focus();
                webview.reload();
              }
            },
            {
              l10nId: 'contextMenu-bookmark',
              icon: 'bookmark',
              onclick: () => {
                webview.focus();
                webview.reload();
              }
            }
          ]
        }
      ];
      const suggestions = [];
      const itemsAfter = [
        { type: 'separator' },
        {
          name: 'Copy',
          l10nId: 'contextMenu-copy',
          icon: 'copy',
          disabled: !event.params.editFlags.canCopy,
          onclick: () => {
            webview.focus();
            webview.copy();
          }
        },
        {
          name: 'Cut',
          l10nId: 'contextMenu-cut',
          icon: 'cut',
          disabled: !event.params.editFlags.canCut,
          hidden: !event.params.isEditable,
          onclick: () => {
            webview.focus();
            webview.cut();
          }
        },
        {
          name: 'Paste',
          l10nId: 'contextMenu-paste',
          icon: 'paste',
          disabled: !event.params.editFlags.canPaste,
          hidden: !event.params.isEditable,
          onclick: () => {
            webview.focus();
            webview.paste();
          }
        },
        {
          name: 'Select All',
          l10nId: 'contextMenu-selectAll',
          icon: 'select-all',
          disabled: !event.params.editFlags.canSelectAll,
          onclick: () => {
            webview.focus();
            webview.selectAll();
          }
        },
        { type: 'separator', hidden: !event.params.isEditable },
        {
          name: 'Delete',
          l10nId: 'contextMenu-delete',
          icon: 'delete',
          disabled: !event.params.editFlags.canDelete,
          hidden: !event.params.isEditable,
          onclick: () => {
            webview.focus();
            webview.delete();
          }
        },
        { type: 'separator' },
        {
          name: `Search ${event.params.selectionText}`,
          l10nId: 'contextMenu-searchSelectionText',
          l10nArgs: {
            value: event.params.selectionText
          },
          icon: 'search',
          hidden: event.params.selectionText === '',
          onclick: () => {
            webview.focus();
            webview.copy();
          }
        },
        {
          name: 'Save As...',
          l10nId: 'contextMenu-saveAs',
          icon: 'save',
          onclick: () => {}
        },
        {
          name: 'Save As PDF',
          l10nId: 'contextMenu-saveAsPdf',
          icon: 'download',
          onclick: () => {}
        },
        {
          name: `Save ${event.params.mediaType}`,
          l10nId: `contextMenu-saveFile-${event.params.mediaType}`,
          icon: 'save-media',
          hidden: event.params.mediaType === 'none',
          onclick: () => {}
        },
        {
          name: 'Print',
          l10nId: 'contextMenu-print',
          icon: 'printer',
          onclick: () => {}
        },
        {
          name: 'Capture Page',
          l10nId: 'contextMenu-capturePage',
          icon: 'screenshot',
          onclick: () => {}
        },
        { type: 'separator' },
        {
          name: 'Inspect Element',
          l10nId: 'contextMenu-inspect',
          icon: 'edit',
          onclick: () => {
            webview.focus();
            devToolsView.src = `orchid://devtools/inspector.html?ws=127.0.0.1:${Environment.debugPort}&webContentsId${webview.getWebContentsId()}`;
            browserView.classList.toggle('devtools-visible');
          }
        }
      ];

      if (event.params.spellcheckEnabled) {
        for (let index = 0; index < event.params.dictionarySuggestions.length; index++) {
          const suggestion = event.params.dictionarySuggestions[index];
          suggestions.push({
            name: `"${suggestion}"`
          });
        }
      }

      ContextMenu.show(event.params.x, event.params.y, [...itemsBefore, ...suggestions, ...itemsAfter]);
    },

    handlePageFaviconUpdated: function (event) {
      const favicon = this.tablist().querySelector('li.active .favicon');
      const gridFavicon = this.tabsViewList().querySelector('.active .favicon');
      favicon.src = event.favicons[0];
      gridFavicon.src = event.favicons[0];
    },

    handlePageTitleUpdated: function (event) {
      const title = this.tablist().querySelector('li.active .title');
      const gridTitle = this.tabsViewList().querySelector('.active .title');
      title.textContent = event.title;
      gridTitle.textContent = event.title;
    },

    handleDidStartNavigation: function () {
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');
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
      const webview = this.browserContainer().querySelector('.browser-view.active > .browser');
      const color = event.themeColor;
      if (color) {
        webview.dataset.themeColor = (color + 'C0').toLowerCase();
        this.chrome().parentElement.dataset.themeColor = color.substring(0, 7);
        this.chrome().parentElement.style.setProperty('--theme-color', color);

        // Calculate the luminance of the color
        const luminance = this.calculateLuminance(color);

        // If the color is light (luminance > 0.5), add 'light' class to the status bar
        if (luminance > 0.5) {
          this.chrome().classList.remove('dark');
          this.chrome().parentElement.classList.remove('dark');
          if (this.statusbar) {
            this.statusbar.classList.remove('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('dark');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('dark');
          }
          this.chrome().classList.add('light');
          this.chrome().parentElement.classList.add('light');
          if (this.statusbar) {
            this.statusbar.classList.add('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('light');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.add('light');
          }
        } else {
          // Otherwise, remove 'light' class
          this.chrome().classList.remove('light');
          this.chrome().parentElement.classList.remove('light');
          if (this.statusbar) {
            this.statusbar.classList.remove('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('light');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('light');
          }
          this.chrome().classList.add('dark');
          this.chrome().parentElement.classList.add('dark');
          if (this.statusbar) {
            this.statusbar.classList.add('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('dark');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.add('dark');
          }
        }
      } else {
        webview.dataset.themeColor = null;
        this.chrome().parentElement.style.setProperty('--theme-color', null);
        this.toolbar().style.setProperty('--theme-color', null);

        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          this.chrome().classList.remove('dark');
          this.chrome().parentElement.classList.remove('dark');
          if (this.statusbar) {
            this.statusbar.classList.remove('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('dark');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('dark');
          }
          this.chrome().classList.add('light');
          this.chrome().parentElement.classList.add('light');
          if (this.statusbar) {
            this.statusbar.classList.add('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('light');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.add('light');
          }
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Otherwise, remove 'light' class
          this.chrome().classList.remove('light');
          this.chrome().parentElement.classList.remove('light');
          if (this.statusbar) {
            this.statusbar.classList.remove('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('light');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('light');
          }
          this.chrome().classList.add('dark');
          this.chrome().parentElement.classList.add('dark');
          if (this.statusbar) {
            this.statusbar.classList.add('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.add('dark');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.add('dark');
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
        new Audio('/resources/sounds/exclamation.wav').play();
        this.ftuDialog().classList.add('alert');
        this.ftuDialog().addEventListener('transitionend', () => {
          this.ftuDialog().classList.remove('alert');
        });
      };

      this.ftuDialog().querySelector('.container').onclick = (event) => {
        event.stopPropagation();
      };

      const pageButtons = this.ftuDialog().querySelectorAll('[data-page-id]');
      for (let index = 0; index < pageButtons.length; index++) {
        const button = pageButtons[index];
        button.addEventListener('click', () => this.handlePageButtonClick(button));
      }

      const panels = this.ftuDialog().querySelectorAll('.page');
      for (let index = 0; index < panels.length; index++) {
        const panel = panels[index];

        panel.dataset.index = index;
        panel.classList.add('next');
      }

      const doneButton = this.ftuDialog().querySelector('.done-button');
      doneButton.onclick = () => {
        this.ftuDialog().classList.remove('visible');
      };

      const accentColorRed = this.ftuDialog().querySelector('.accent-colors .red');
      const accentColorYellow = this.ftuDialog().querySelector('.accent-colors .yellow');
      const accentColorGreen = this.ftuDialog().querySelector('.accent-colors .green');
      const accentColorBlue = this.ftuDialog().querySelector('.accent-colors .blue');
      const accentColorPurple = this.ftuDialog().querySelector('.accent-colors .purple');

      accentColorRed.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 192);
        document.scrollingElement.style.setProperty('--accent-color-g', 0);
        document.scrollingElement.style.setProperty('--accent-color-b', 64);
        Settings.setValue('homescreen.accent_color.rgb', {
          r: 192,
          g: 0,
          b: 64
        });
      };
      accentColorYellow.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 255);
        document.scrollingElement.style.setProperty('--accent-color-g', 192);
        document.scrollingElement.style.setProperty('--accent-color-b', 0);
        Settings.setValue('homescreen.accent_color.rgb', {
          r: 255,
          g: 192,
          b: 0
        });
      };
      accentColorGreen.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 64);
        document.scrollingElement.style.setProperty('--accent-color-g', 160);
        document.scrollingElement.style.setProperty('--accent-color-b', 96);
        Settings.setValue('homescreen.accent_color.rgb', {
          r: 64,
          g: 160,
          b: 96
        });
      };
      accentColorBlue.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', null);
        document.scrollingElement.style.setProperty('--accent-color-g', null);
        document.scrollingElement.style.setProperty('--accent-color-b', null);
        Settings.setValue('homescreen.accent_color.rgb', {
          r: null,
          g: null,
          b: null
        });
      };
      accentColorPurple.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 128);
        document.scrollingElement.style.setProperty('--accent-color-g', 48);
        document.scrollingElement.style.setProperty('--accent-color-b', 160);
        Settings.setValue('homescreen.accent_color.rgb', {
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
        selectedPanel.classList.toggle('previous', selectedPanel.dataset.index <= targetPanel.dataset.index);
        selectedPanel.classList.toggle('next', selectedPanel.dataset.index >= targetPanel.dataset.index);
      }

      targetPanel.classList.toggle('visible');
      targetPanel.classList.toggle('previous', selectedPanel.dataset.index <= targetPanel.dataset.index);
      targetPanel.classList.toggle('next', selectedPanel.dataset.index >= targetPanel.dataset.index);
    }
  };

  exports.Browser = Browser;
})(window);
