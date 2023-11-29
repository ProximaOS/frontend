!(function (exports) {
  'use strict';

  class Chrome {
    constructor (chromeElement, url, isVisible = true) {
      this.chromeElement = chromeElement;
      this.url = url;
      this.isVisible = isVisible;

      this.screen = document.getElementById('screen');
      this.statusbar = document.getElementById('statusbar');
      this.softwareButtons = document.getElementById('software-buttons');
      this.bottomPanel = document.getElementById('bottom-panel');

      this.DEFAULT_URL = 'https://browser.localhost:8081/index.html';
      this.SEARCH_ENGINE = 0;

      this.searchIcon = 'https://www.google.com/favicon.ico';
      this.searchUrl = 'https://duckduckgo.com/?q={searchTerms}';
      this.suggestUrl = 'https://duckduckgo.com/ac/?q={searchTerms}';

      this.lastScroll = 0;
      this.currentScroll = 0;
      this.tabAmount = 0;

      this.ADDON_ICON_SIZE = 20 * window.devicePixelRatio;

      fetch('http://system.localhost:8081/elements/chrome_interface.html').then((response) => {
        response.text().then((htmlContent) => {
          this.htmlContent = htmlContent;
          this.init();
        });
      });
    }

    async init () {
      this.chromeElement.innerHTML = this.htmlContent;

      this.toolbar = this.chromeElement.querySelector('.toolbar');
      this.tablistHolder = this.chromeElement.querySelector('.tablist-holder');
      this.tablist = this.chromeElement.querySelector('.tablist');
      this.profileButton = this.chromeElement.querySelector('.profile-button');
      this.sideTabsButton = this.chromeElement.querySelector('.side-tabs-button');
      this.addButton = this.chromeElement.querySelector('.add-button');
      this.navbarBackButton = this.chromeElement.querySelector('.navbar-back-button');
      this.navbarForwardButton = this.chromeElement.querySelector('.navbar-forward-button');
      this.navbarReloadButton = this.chromeElement.querySelector('.navbar-reload-button');
      this.navbarHomeButton = this.chromeElement.querySelector('.navbar-home-button');
      this.navbarSplitButton = this.chromeElement.querySelector('.navbar-split-button');
      this.navbarTabsButton = this.chromeElement.querySelector('.navbar-tabs-button');
      this.navbarDownloadsButton = this.chromeElement.querySelector('.navbar-downloads-button');
      this.navbarLibraryButton = this.chromeElement.querySelector('.navbar-library-button');
      this.navbarAddonsButton = this.chromeElement.querySelector('.navbar-addons-button');
      this.navbarOptionsButton = this.chromeElement.querySelector('.navbar-options-button');
      this.urlbar = this.chromeElement.querySelector('.urlbar');
      this.urlbarInput = this.chromeElement.querySelector('.urlbar-input');
      this.urlbarDisplayUrl = this.chromeElement.querySelector('.urlbar-display-url');
      this.urlbarSSLButton = this.chromeElement.querySelector('.urlbar-ssl-button');
      this.suggestions = this.chromeElement.querySelector('.suggestions');
      this.addonsButtons = this.chromeElement.querySelector('.addons-buttons');
      this.browserContainer = this.chromeElement.querySelector('.browser-container');
      this.tabsView = this.chromeElement.querySelector('.tabs-view');
      this.tabsViewCloseButton = this.chromeElement.querySelector('.tabs-view-close-button');
      this.tabsViewAddButton = this.chromeElement.querySelector('.tabs-view-add-button');
      this.tabsViewList = this.chromeElement.querySelector('.tabs-view .grid');
      this.dropdown = this.chromeElement.querySelector('.dropdown');
      this.ftuDialog = this.chromeElement.querySelector('.ftu-dialog');
      this.tablistPreview = this.chromeElement.querySelector('.tablist-preview');
      this.tablistPreviewImage = this.chromeElement.querySelector('.tablist-preview .preview-image');
      this.tablistPreviewTitle = this.chromeElement.querySelector('.tablist-preview .title');
      this.tablistPreviewIcon = this.chromeElement.querySelector('.tablist-preview .icon');
      this.tablistPreviewOrigin = this.chromeElement.querySelector('.tablist-preview .origin');
      this.tablistPreviewMediaNotice = this.chromeElement.querySelector('.tablist-preview .media-notice');
      this.tablistPreviewHibernationNotice = this.chromeElement.querySelector('.tablist-preview .hibernation-notice');
      this.addonDropdown = this.chromeElement.querySelector('.addon-dropdown');
      this.addonDropdownBrowser = this.chromeElement.querySelector('.addon-dropdown .browser');

      this.tablistHolder.addEventListener('contextmenu', this.handleTablistHolderContextMenu.bind(this));
      this.sideTabsButton.addEventListener('click', this.handleSideTabsButton.bind(this));
      this.addButton.addEventListener('click', this.openNewTab.bind(this, false));
      this.urlbarInput.addEventListener('focus', this.handleUrlbarInputFocus.bind(this));
      this.urlbarInput.addEventListener('blur', this.handleUrlbarInputBlur.bind(this));
      this.urlbarInput.addEventListener('keydown', this.handleUrlbarInputKeydown.bind(this));
      this.navbarBackButton.addEventListener('click', this.handleNavbarBackButton.bind(this));
      this.navbarForwardButton.addEventListener('click', this.handleNavbarForwardButton.bind(this));
      this.navbarReloadButton.addEventListener('click', this.handleNavbarReloadButton.bind(this));
      this.navbarHomeButton.addEventListener('click', this.handleNavbarHomeButton.bind(this));
      this.navbarSplitButton.addEventListener('click', this.handleNavbarSplitButton.bind(this));
      this.navbarTabsButton.addEventListener('click', this.handleNavbarTabsButton.bind(this));
      this.navbarDownloadsButton.addEventListener('click', this.handleNavbarDownloadsButton.bind(this));
      this.navbarLibraryButton.addEventListener('click', this.handleNavbarLibraryButton.bind(this));
      this.navbarAddonsButton.addEventListener('click', this.handleNavbarAddonsButton.bind(this));
      this.navbarOptionsButton.addEventListener('click', this.handleNavbarOptionsButton.bind(this));
      this.urlbarSSLButton.addEventListener('click', this.handleUrlbarSSLButton.bind(this));
      this.tabsViewCloseButton.addEventListener('click', this.handleTabsViewCloseButton.bind(this));
      this.tabsViewAddButton.addEventListener('click', this.openNewTab.bind(this));

      if (this.isVisible) {
        this.chromeElement.classList.add('visible');
        this.chromeElement.parentElement.classList.add('chrome-visible');

        Settings.getValue('ftu.browser.enabled').then((value) => {
          if (value) {
            this.openFtuDialog();
          }
        });
      }

      Settings.getValue('general.chrome.position').then((data) => {
        this.chromeElement.classList.add(data);
      });
      Settings.addObserver('general.chrome.position', (data) => {
        this.chromeElement.classList.remove('top');
        this.chromeElement.classList.remove('bottom');
        this.chromeElement.classList.add(data);
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
        this.chromeElement.classList.add('dark');
        this.chromeElement.parentElement.classList.add('dark');
      } else {
        this.chromeElement.classList.add('light');
        this.chromeElement.parentElement.classList.add('light');
      }

      this.chromeElement.dataset.id = 0;
      this.DEFAULT_URL = this.url;
      if ('CardPanel' in window) {
        CardPanel.init();
      }
      this.openNewTab(false, this.url);

      const avatarImage = this.profileButton.querySelector('.avatar');
      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          this.profileButton.classList.add('logged-in');
          OrchidServices.getWithUpdate(`profile/${await OrchidServices.userId()}`, function (data) {
            avatarImage.src = data.profile_picture;
          });
        }
      }

      if (this.statusbar) {
        this.statusbar.addEventListener('dblclick', this.handleStatusbarDoubleClick.bind(this));
      }

      this.addonDropdownBrowser.addEventListener('dom-ready', () => {
        const webContents = webview.getWebContents();
        const scrollHeight = webContents.executeJavaScript('document.body.scrollHeight');
        this.addonDropdown.style.height = scrollHeight + 'px';
      });

      const apps = await AppsManager.getAll();
      const addons = apps.filter((app) => app.manifest.role === 'addon');
      const addonFragment = document.createDocumentFragment();
      for (let index = 0; index < addons.length; index++) {
        const addon = addons[index];

        const addonButton = document.createElement('button');
        addonButton.title = addon.manifest.name;
        addonFragment.appendChild(addonButton);

        addonButton.onclick = () => {
          const chromeBox = this.chromeElement.getBoundingClientRect();
          const addonDropdownBox = this.addonDropdown.getBoundingClientRect();
          const addonButtonBox = addonButton.getBoundingClientRect();
          let x = addonButtonBox.left - chromeBox.left;
          const y = addonButtonBox.top + addonButtonBox.height - chromeBox.top;

          if (x > window.innerWidth / 2) {
            x = addonButtonBox.left - addonDropdownBox.width - chromeBox.left + addonButtonBox.width;
          }

          this.addonDropdown.style.left = x + 'px';
          this.addonDropdown.style.top = y + 'px';
          setTimeout(() => {
            this.addonDropdown.classList.add('visible');
          }, 16);

          const url = new URL(addon.manifestUrl['en-US']);
          this.addonDropdownBrowser.src = url.origin + addon.manifest.dropdown.launch_path;
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
          addonIcon.src = url.origin + entry[1];
        }
      }
      this.addonsButtons.appendChild(addonFragment);
    }

    handleStatusbarDoubleClick () {
      const webview = this.chromeElement.querySelector('.browser-container .browser-view.active > .browser');
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
    }

    handleTablistHolderContextMenu (event) {
      const appId = this.chromeElement.parentElement.id;

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
          keybind: ['ctrl', 't'],
          onclick: () => this.openNewTab(false)
        },
        {
          name: 'New Private Tab',
          l10nId: 'browserMenu-newPrivateTab',
          icon: 'privacy',
          keybind: ['ctrl', 'shift', 't'],
          onclick: () => this.openNewTab(true)
        },
        { type: 'separator' },
        {
          name: 'Toggle Side Tabs',
          l10nId: 'browserMenu-sideTabs',
          icon: 'side-tabs',
          onclick: () => this.chromeElement.classList.toggle('side-tabs')
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
    }

    handleSideTabsButton () {
      this.chromeElement.classList.toggle('side-tabs');
    }

    openNewTab (isPrivate = false, url) {
      this.chromeElement.dataset.id++;
      this.navbarTabsButton.dataset.amount = this.chromeElement.dataset.id;

      const tab = document.createElement('li');
      if (isPrivate) {
        tab.classList.add('private');
      }
      tab.classList.add('expand');
      tab.addEventListener('animationend', () => {
        tab.classList.remove('expand');
      });
      this.tablist.appendChild(tab);

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
      muteButton.style.display = 'none';
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
      this.tabsViewList.appendChild(gridTab);

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
      this.browserContainer.appendChild(browserView);

      const webview = document.createElement('webview');
      setTimeout(() => {
        webview.src = url || this.DEFAULT_URL;
      }, 300);
      webview.classList.add('browser');
      browserView.appendChild(webview);

      const splitView = document.createElement('webview');
      setTimeout(() => {
        splitView.src = url || this.DEFAULT_URL;
      }, 300);
      splitView.classList.add('browser');
      splitView.classList.add('split');
      browserView.appendChild(splitView);

      Settings.getValue('general.chrome.user_agent').then((value) => this.updateUserAgent(webview, value));
      Settings.addObserver('general.chrome.user_agent', (value) => this.updateUserAgent(webview, value));

      if (isPrivate) {
        webview.partition = 'private';
        webview.classList.add('private');
        splitView.partition = 'private';
        splitView.classList.add('private');
      }

      const devToolsView = document.createElement('webview');
      devToolsView.classList.add('devtools');
      browserView.appendChild(devToolsView);

      webview.addEventListener('ipc-message', this.handleIpcMessage.bind(this));
      webview.addEventListener('context-menu', this.handleContextMenu.bind(this));
      webview.addEventListener('page-favicon-updated', this.handlePageFaviconUpdated.bind(this));
      webview.addEventListener('page-title-updated', this.handlePageTitleUpdated.bind(this));
      webview.addEventListener('will-navigate', this.handleNavigation.bind(this));
      webview.addEventListener('will-frame-navigate', this.handleNavigation.bind(this));
      webview.addEventListener('did-redirect-navigation', this.handleNavigation.bind(this));
      webview.addEventListener('did-start-navigation', this.handleNavigation.bind(this));
      webview.addEventListener('did-change-theme-color', this.handleThemeColorUpdated.bind(this));
      splitView.addEventListener('ipc-message', this.handleIpcMessage.bind(this));
      splitView.addEventListener('context-menu', this.handleContextMenu.bind(this));
      splitView.addEventListener('page-favicon-updated', this.handlePageFaviconUpdated.bind(this));
      splitView.addEventListener('page-title-updated', this.handlePageTitleUpdated.bind(this));
      splitView.addEventListener('will-navigate', this.handleNavigation.bind(this));
      splitView.addEventListener('will-frame-navigate', this.handleNavigation.bind(this));
      splitView.addEventListener('did-redirect-navigation', this.handleNavigation.bind(this));
      splitView.addEventListener('did-start-navigation', this.handleNavigation.bind(this));
      splitView.addEventListener('did-change-theme-color', this.handleThemeColorUpdated.bind(this));

      webview.addEventListener('did-start-loading', () => {
        this.navbarReloadButton.classList.add('stop');
        favicons.classList.add('loading');
        favicons.classList.remove('dom-loading');
      });

      webview.addEventListener('dom-ready', () => {
        favicons.classList.add('loading');
        favicons.classList.add('dom-loading');
      });

      webview.addEventListener('did-stop-loading', () => {
        this.navbarReloadButton.classList.remove('stop');
        favicons.classList.remove('loading');
        favicons.classList.remove('dom-loading');

        const splashElement = this.chromeElement.parentElement.querySelector('.splashscreen');
        if (splashElement) {
          splashElement.classList.add('hidden');
        }
      });

      webview.addEventListener('enter-html-full-screen', (event) => {
        event.preventDefault();
        this.chromeElement.parentElement.classList.add('fullscreen');
      });

      webview.addEventListener('leave-html-full-screen', (event) => {
        event.preventDefault();
        this.chromeElement.parentElement.classList.remove('fullscreen');
      });

      webview.addEventListener('close', () => {
        tab.remove();
        gridTab.remove();
        browserView.remove();

        if (this.browserContainer.children.length === 0) {
          if ('AppWindow' in window) {
            AppWindow.close(this.chromeElement.parentElement.id);
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
        webview.addEventListener(eventType, () => this.handleMediaStateChange(webview, muteButton));
      });

      splitView.addEventListener('did-start-loading', () => {
        this.navbarReloadButton.classList.add('stop');
        favicons.classList.add('loading');
        favicons.classList.remove('dom-loading');
      });

      splitView.addEventListener('dom-ready', () => {
        favicons.classList.add('loading');
        favicons.classList.add('dom-loading');
      });

      splitView.addEventListener('did-stop-loading', () => {
        this.navbarReloadButton.classList.remove('stop');
        favicons.classList.remove('loading');
        favicons.classList.remove('dom-loading');

        const splashElement = this.chromeElement.parentElement.querySelector('.splashscreen');
        if (splashElement) {
          splashElement.classList.add('hidden');
        }
      });

      splitView.addEventListener('enter-html-full-screen', (event) => {
        event.preventDefault();
        this.chromeElement.parentElement.classList.add('fullscreen');
      });

      splitView.addEventListener('leave-html-full-screen', (event) => {
        event.preventDefault();
        this.chromeElement.parentElement.classList.remove('fullscreen');
      });

      splitView.addEventListener('close', () => {
        tab.remove();
        gridTab.remove();
        browserView.remove();

        if (this.browserContainer.children.length === 0) {
          if ('AppWindow' in window) {
            AppWindow.close(this.chromeElement.parentElement.id);
          } else {
            window.close();
          }
        }
      });

      ['did-start-loading', 'did-start-navigation', 'did-stop-loading', 'dom-ready'].forEach((eventType) => {
        splitView.addEventListener(eventType, () => {
          if (!isPrivate) {
            DisplayManager.screenshot(splitView.getWebContentsId()).then((data) => {
              gridPreview.src = data;
            });
          }
        });
      });

      ['media-started-playing', 'media-paused'].forEach((eventType) => {
        splitView.addEventListener(eventType, () => this.handleMediaStateChange(splitView, muteButton));
      });

      this.focusTab(tab, gridTab, browserView, webview);

      tab.addEventListener('click', () => this.focusTab(tab, gridTab, browserView, webview));
      tab.addEventListener('mouseover', () => this.handleTabHover(tab, webview, favicon.src));
      tab.addEventListener('mouseleave', this.handleTabUnhover.bind(this));
      gridTab.addEventListener('click', (event) => this.focusTab(event, tab, gridTab, browserView, webview));
      closeButton.addEventListener('click', (event) => this.closeTab(event, tab, gridTab, browserView));
      gridCloseButton.addEventListener('click', (event) => this.closeTab(event, tab, gridTab, browserView));
      muteButton.addEventListener('click', (event) => this.toggleMuteTab(event, webview, muteButton));
    }

    closeTab (event, tab, gridTab, browserView) {
      event.stopPropagation();

      this.chromeElement.dataset.id--;
      this.navbarTabsButton.dataset.amount = this.chromeElement.dataset.id;

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
    }

    focusTab (tab, gridTab, browserView, webview) {
      const tabs = this.chromeElement.querySelectorAll('.tablist li');
      for (let index = 0; index < tabs.length; index++) {
        const tab = tabs[index];
        tab.classList.remove('active');
      }

      const gridTabs = this.chromeElement.querySelectorAll('.tabs-view .grid .tab');
      for (let index = 0; index < gridTabs.length; index++) {
        const gridTab = gridTabs[index];
        gridTab.classList.remove('active');
      }

      const browserViews = this.chromeElement.querySelectorAll('.browser-container .browser-view');
      for (let index = 0; index < browserViews.length; index++) {
        const browserView = browserViews[index];
        browserView.classList.remove('active');

        const webviews = browserView.querySelectorAll('.browser');
        for (let index1 = 0; index1 < webviews.length; index1++) {
          const webview1 = webviews[index1];
          if (webview || TasksManager.getThrottle(webview1.getWebContentsId())) {
            continue;
          }
          TasksManager.setThrottle(webview1.getWebContentsId(), true);
        }
      }

      tab.classList.add('active');
      gridTab.classList.add('active');
      browserView.classList.add('active');
      if (!TasksManager.getThrottle(webview.getWebContentsId())) {
        TasksManager.setThrottle(webview.getWebContentsId(), false);
      }

      setTimeout(() => {
        this.handleNavigation();
      }, 100);
    }

    toggleMuteTab (event, webview, muteButton) {
      event.stopPropagation();

      if (webview.isAudioMuted()) {
        webview.setAudioMuted(false);
        muteButton.dataset.icon = 'audio';
      } else {
        webview.setAudioMuted(true);
        muteButton.dataset.icon = 'audio-muted';
      }
    }

    handleTabHover (tab, webview, faviconSrc) {
      const chromeBox = this.chromeElement.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      const x = tabBox.left - chromeBox.left;
      const y = tabBox.top + tabBox.height + 5 - chromeBox.top;

      this.tablistPreview.style.left = x + 'px';
      this.tablistPreview.style.top = y + 'px';

      this.tablistPreview.classList.add('visible');
      DisplayManager.screenshot(webview.getWebContentsId()).then((data) => {
        this.tablistPreviewImage.src = data;
        this.tablistPreviewImage.onload = () => {
          tab.dataset.previewImage = data;
        };
        this.tablistPreviewImage.onerror = () => {
          if (!tab.dataset.previewImage) {
            return;
          }
          this.tablistPreviewImage.src = tab.dataset.previewImage;
        };
      });
      this.tablistPreviewTitle.textContent = webview.getTitle();
      this.tablistPreviewIcon.src = faviconSrc;
      const url = new URL(webview.getURL());
      this.tablistPreviewOrigin.textContent = url.origin;
    }

    handleTabUnhover () {
      this.tablistPreview.classList.remove('visible');
    }

    handleMediaStateChange (webview, muteButton) {
      if (webview.isCurrentlyAudible()) {
        this.timeoutID = setTimeout(() => {
          muteButton.style.display = 'none';
        }, 1000);
      } else {
        if (webview.isAudioMuted()) {
          muteButton.dataset.icon = 'audio-muted';
        } else {
          muteButton.dataset.icon = 'audio';
        }
        muteButton.style.display = 'block';
      }
    }

    updateUserAgent (webview, value) {
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

    updateSuggestions () {
      const inputText = this.urlbarInput.value;

      fetch(this.suggestUrl.replace('{searchTerms}', encodeURI(inputText))).then((suggestionData) => {
        suggestionData.json.then((data) => {
          this.suggestions.innerHTML = '';
          for (let index = 0; index < data[1].length; index++) {
            const item = data[1][index];

            const suggestion = document.createElement('div');
            suggestion.classList.add('suggestion');
            suggestion.addEventListener('click', () => {
              const webview = this.chromeElement.querySelector('.browser-container .browser-view.active > .browser');
              webview.src = this.searchUrl.replace('{searchTerms}', encodeURI(item));
            });
            this.suggestions.appendChild(suggestion);

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
    }

    handleUrlbarInputFocus (event) {
      this.urlbar.classList.add('suggestions-visible');
    }

    handleUrlbarInputBlur (event) {
      this.urlbar.classList.remove('suggestions-visible');
    }

    handleUrlbarInputKeydown (event) {
      function checkURL (url) {
        const urlPattern = /^(\w+?:\/\/)?([\w-]+\.)*[\w-]+(:\d+)?(\/[\w-./?%&=]*)?$/;

        const isURL = urlPattern.test(url);
        const hasProtocol = /^(\w+?:\/\/)/.test(url);

        return {
          isURL,
          hasProtocol
        };
      }

      if (event.key === 'Enter') {
        const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
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
    }

    handleNavbarBackButton () {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
      if (webview.canGoBack()) {
        webview.goBack();
      }
    }

    handleNavbarForwardButton () {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
      if (webview.canGoForward()) {
        webview.goForward();
      }
    }

    handleNavbarReloadButton () {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
      webview.reload();
    }

    handleNavbarHomeButton () {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
      webview.src = this.DEFAULT_URL;
    }

    handleNavbarSplitButton () {
      const browserView = this.browserContainer.querySelector('.browser-view.active');
      const splitView = this.browserContainer.querySelector('.browser-view.active > .split');
      browserView.classList.toggle('split-enabled');
      if (browserView.classList.contains('split-enabled')) {
        splitView.src = this.DEFAULT_URL;
      }

      this.navbarSplitButton.classList.toggle('active');
    }

    handleNavbarTabsButton () {
      this.chromeElement.classList.toggle('tabs-view-visible');
      this.tabsView.classList.toggle('visible');
    }

    handleNavbarDownloadsButton (event) {
      this.openDropdown('downloads');
    }

    handleNavbarLibraryButton (event) {
      this.openDropdown('library');
    }

    handleNavbarAddonsButton (event) {
      ContextMenu({});
    }

    async handleNavbarOptionsButton (event) {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');

      const box = this.navbarOptionsButton.getBoundingClientRect();
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
          keybind: ['ctrl', 'h'],
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
          keybind: ['ctrl', 'l'],
          onclick: () => this.openNewTab(false, 'orchid://webapps/')
        },
        { type: 'separator' },
        {
          name: 'Reader Mode',
          l10nId: 'dropdown-readerMode',
          icon: 'reader-mode',
          onclick: () => {
            if (webview.getURL.startsWith('orchidreader://')) {
              webview.url = webview.getURL.substring('orchidreader://?content='.length);
            } else {
              webview.url = `orchidreader://?content=${webview.getURL()}`;
            }
          }
        },
        {
          name: 'Translate',
          l10nId: 'dropdown-translate',
          icon: 'translate',
          isNewlyAdded: true,
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
                const duration = 250; // 250ms transition time

                const startTime = performance.now();
                function animateZoom () {
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
                const duration = 250; // 250ms transition time

                const startTime = performance.now();
                function animateZoom () {
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
                const duration = 250; // 250ms transition time

                const startTime = performance.now();
                function animateZoom () {
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
              AppWindow.close(this.chromeElement.parentElement.id);
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
        ContextMenu.show(x, y, menu, this.navbarOptionsButton);
      }, 16);
    }

    requestBookmark () {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');

      ModalDialog.showPrompt(L10n.get('bookmark'), L10n.get('bookmark-detail'), (value) => {
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
    }

    async handleUrlbarSSLButton (event) {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');

      const box = this.urlbarSSLButton.getBoundingClientRect();
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
          l10nId: 'ssl-userAgent',
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
        ContextMenu.show(x, y, menu, this.urlbarSSLButton);
      }, 16);
    }

    handleTabsViewCloseButton () {
      this.chromeElement.classList.remove('tabs-view-visible');
      this.tabsView.classList.remove('visible');
    }

    handleIpcMessage (event) {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');

      const scrollPosition = event.args[0].top;
      let progress = scrollPosition / 80;

      switch (event.channel) {
        case 'scroll':
          progress = Math.min(1, progress);
          webview.style.setProperty('--scroll-progress', progress);

          if (!this.chromeElement.classList.contains('chrome-visible')) {
            return;
          }

          this.currentScroll = event.args[0].top;
          if (this.currentScroll > this.lastScroll + 50) {
            this.chromeElement.classList.remove('visible');
            this.lastScroll = event.args[0].top;
          } else if (this.currentScroll < this.lastScroll - 50) {
            this.chromeElement.classList.add('visible');
            this.lastScroll = event.args[0].top;
          }
          break;

        default:
          break;
      }
    }

    handleContextMenu (event) {
      const browserView = this.browserContainer.querySelector('.browser-view.active');
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
      const devToolsView = this.browserContainer.querySelector('.browser-view.active > .devtools');

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
    }

    handlePageFaviconUpdated (event) {
      const favicon = this.tablist.querySelector('li.active .favicon');
      const gridFavicon = this.tabsViewList.querySelector('.active .favicon');
      favicon.src = event.favicons[0];
      gridFavicon.src = event.favicons[0];
    }

    handlePageTitleUpdated (event) {
      const title = this.tablist.querySelector('li.active .title');
      const gridTitle = this.tabsViewList.querySelector('.active .title');
      title.textContent = event.title;
      gridTitle.textContent = event.title;
    }

    handleNavigation () {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
      this.urlbarInput.value = webview.getURL();

      if (webview.getURL() === this.DEFAULT_URL) {
        this.urlbarDisplayUrl.innerText = L10n.get('urlbar');
      } else {
        const url = new URL(webview.getURL());
        this.urlbarDisplayUrl.innerHTML = `
          <div class="ignored">${url.protocol}//</div>
          <div class="highlighted">${url.host}</div>
          <div class="ignored">${url.pathname}</div>
          <div class="ignored">${url.search}</div>
          <div class="ignored">${url.hash}</div>
        `;
      }
    }

    handleThemeColorUpdated (event) {
      const webview = this.browserContainer.querySelector('.browser-view.active > .browser');
      const color = event.themeColor;
      if (color) {
        webview.dataset.themeColor = (color + 'C0').toLowerCase();
        this.chromeElement.parentElement.dataset.themeColor = color.substring(0, 7);
        this.chromeElement.parentElement.style.setProperty('--theme-color', color);

        // Calculate the luminance of the color
        const luminance = this.calculateLuminance(color);

        // If the color is light (luminance > 0.5), add 'light' class to the status bar
        if (luminance > 0.5) {
          this.chromeElement.classList.remove('dark');
          this.chromeElement.parentElement.classList.remove('dark');
          if (this.statusbar) {
            this.statusbar.classList.remove('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('dark');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('dark');
          }
          this.chromeElement.classList.add('light');
          this.chromeElement.parentElement.classList.add('light');
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
          this.chromeElement.classList.remove('light');
          this.chromeElement.parentElement.classList.remove('light');
          if (this.statusbar) {
            this.statusbar.classList.remove('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('light');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('light');
          }
          this.chromeElement.classList.add('dark');
          this.chromeElement.parentElement.classList.add('dark');
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
        this.chromeElement.parentElement.style.setProperty('--theme-color', null);
        this.toolbar.style.setProperty('--theme-color', null);

        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          this.chromeElement.classList.remove('dark');
          this.chromeElement.parentElement.classList.remove('dark');
          if (this.statusbar) {
            this.statusbar.classList.remove('dark');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('dark');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('dark');
          }
          this.chromeElement.classList.add('light');
          this.chromeElement.parentElement.classList.add('light');
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
          this.chromeElement.classList.remove('light');
          this.chromeElement.parentElement.classList.remove('light');
          if (this.statusbar) {
            this.statusbar.classList.remove('light');
          }
          if (this.softwareButtons) {
            this.softwareButtons.classList.remove('light');
          }
          if (this.bottomPanel) {
            this.bottomPanel.classList.remove('light');
          }
          this.chromeElement.classList.add('dark');
          this.chromeElement.parentElement.classList.add('dark');
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
    }

    calculateLuminance (color) {
      // Convert the color to RGB values
      const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      const r = parseInt(rgb[1], 16);
      const g = parseInt(rgb[2], 16);
      const b = parseInt(rgb[3], 16);

      // Calculate relative luminance
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      return luminance;
    }

    openFtuDialog () {
      this.ftuDialog.classList.add('visible');
      this.ftuDialog.onclick = () => {
        new Audio('/resources/sounds/exclamation.wav').play();
        this.ftuDialog.classList.add('alert');
        this.ftuDialog.addEventListener('transitionend', () => {
          this.ftuDialog.classList.remove('alert');
        });
      };

      this.ftuDialog.querySelector('.container').onclick = (event) => {
        event.stopPropagation();
      };

      const pageButtons = this.ftuDialog.querySelectorAll('[data-page-id]');
      for (let index = 0; index < pageButtons.length; index++) {
        const button = pageButtons[index];
        button.addEventListener('click', () => this.handlePageButtonClick(button));
      }

      const panels = this.ftuDialog.querySelectorAll('.page');
      for (let index = 0; index < panels.length; index++) {
        const panel = panels[index];

        panel.dataset.index = index;
        panel.classList.add('next');
      }

      const doneButton = this.ftuDialog.querySelector('.done-button');
      doneButton.onclick = () => {
        this.ftuDialog.classList.remove('visible');
      };

      const accentColorRed = this.ftuDialog.querySelector('.accent-colors .red');
      const accentColorYellow = this.ftuDialog.querySelector('.accent-colors .yellow');
      const accentColorGreen = this.ftuDialog.querySelector('.accent-colors .green');
      const accentColorBlue = this.ftuDialog.querySelector('.accent-colors .blue');
      const accentColorPurple = this.ftuDialog.querySelector('.accent-colors .purple');

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
    }

    handlePageButtonClick (button) {
      const id = button.dataset.pageId;
      const selectedPanel = this.ftuDialog.querySelector('.page.visible');

      this.togglePanelVisibility(selectedPanel, id);
    }

    togglePanelVisibility (selectedPanel, targetPanelId) {
      const targetPanel = this.ftuDialog.querySelector(`.${targetPanelId}`);

      if (selectedPanel) {
        selectedPanel.classList.toggle('visible');
        selectedPanel.classList.toggle('previous', selectedPanel.dataset.index <= targetPanel.dataset.index);
        selectedPanel.classList.toggle('next', selectedPanel.dataset.index >= targetPanel.dataset.index);
      }

      targetPanel.classList.toggle('visible');
      targetPanel.classList.toggle('previous', selectedPanel.dataset.index <= targetPanel.dataset.index);
      targetPanel.classList.toggle('next', selectedPanel.dataset.index >= targetPanel.dataset.index);
    }
  }

  exports.Chrome = Chrome;
})(window);
