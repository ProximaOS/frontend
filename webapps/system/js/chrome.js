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
    suggestUrl:
      'https://www.google.com/complete/search?output=chrome&q={searchTerms}',

    toolbar: function () {
      return this.chrome().querySelector('.toolbar');
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

    suggestions: function () {
      return this.chrome().querySelector('.suggestions');
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

    init: function (chromeElement, url, isChromeEnabled = true) {
      this.chrome = function () {
        if (chromeElement) {
          return chromeElement;
        }

        if (AppWindow) {
          return AppWindow.focusedWindow.querySelector('.chrome');
        }
      };

      fetch('http://system.localhost:8081/elements/chrome_interface.html').then(
        (response) => {
          response.text().then((htmlContent) => {
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

            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
              if (this.statusbar) {
                this.statusbar.classList.add('light');
              }
              if (this.softwareButtons) {
                this.softwareButtons.classList.add('light');
              }
              if (this.bottomPanel) {
                this.bottomPanel.classList.add('light');
              }
              this.chrome().classList.add('light');
              this.chrome().parentElement.classList.add('light');
            } else if (
              window.matchMedia('(prefers-color-scheme: dark)').matches
            ) {
              if (this.statusbar) {
                this.statusbar.classList.add('dark');
              }
              if (this.softwareButtons) {
                this.softwareButtons.classList.add('dark');
              }
              if (this.bottomPanel) {
                this.bottomPanel.classList.add('dark');
              }
              this.chrome().classList.add('dark');
              this.chrome().parentElement.classList.add('dark');
            }

            this.chrome().dataset.id = 0;
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
            this.navbarDownloadsButton().addEventListener(
              'click',
              this.handleNavbarDownloadsButton.bind(this)
            );
            this.navbarLibraryButton().addEventListener(
              'click',
              this.handleNavbarLibraryButton.bind(this)
            );
            this.navbarAddonsButton().addEventListener(
              'click',
              this.handleNavbarAddonsButton.bind(this)
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
          });
        }
      );
    },

    handeSideTabsButton: function () {
      this.chrome().classList.toggle('sidetabs');
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
      webview.useragent = navigator.userAgent;
      webview.preload = `file://${
        Environment.type === 'production'
          ? Environment.dirName().replaceAll('\\', '/')
          : Environment.currentDir.replaceAll('\\', '/')
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
          this.chrome().parentElement.querySelector('.splashscreen');
        if (splashElement) {
          splashElement.classList.add('hidden');
        }
      });

      webview.addEventListener('close', () => {
        tab.remove();
        gridTab.remove();
        webview.remove();

        if (this.browserContainer().children.length === 0) {
          if ('AppWindow' in window) {
            AppWindow.close(this.chrome().parentElement.id);
          } else {
            window.close();
          }
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
          } else {
            webview.nodeintegration = false;
          }

          if (!isPrivate) {
            webview.capturePage().then((data) => {
              gridPreview.src = data.toDataURL();
            });
          }
        });
      });

      const focus = () => {
        const tabs = this.chrome().querySelectorAll('.tablist li');
        tabs.forEach(function (tab) {
          tab.classList.remove('active');
        });

        const gridTabs = this.chrome().querySelectorAll(
          '.tabs-view .grid .tab'
        );
        gridTabs.forEach(function (gridTab) {
          gridTab.classList.remove('active');
        });

        const webviews = this.chrome().querySelectorAll(
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
        webview.remove();
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
        webview.remove();
      });
    },

    updateSuggestions: function () {
      const inputText = this.urlbarInput().value;

      fetch(
        this.suggestUrl.replace('{searchTerms}', encodeURI(inputText))
      ).then((suggestionData) => {
        suggestionData.json().then((data) => {
          this.suggestions().innerHTML = '';
          data[1].forEach((item) => {
            const suggestion = document.createElement('div');
            suggestion.classList.add('suggestion');
            suggestion.addEventListener('click', () => {
              const webview = this.chrome().querySelector(
                '.browser-container .browser.active'
              );
              webview.src = this.searchUrl.replace(
                '{searchTerms}',
                encodeURI(item)
              );
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
          });
        });
      });
    },

    handleUrlbarInputKeydown: function (event) {
      function checkURL(url) {
        const urlPattern =
          /^(https?:\/\/)?([\w-]+\.)*[\w-]+(:\d+)?(\/[\w-./?%&=]*)?$/;

        const isURL = urlPattern.test(url);
        const hasProtocol = /^(https?:\/\/)/.test(url);

        return {
          isURL,
          hasProtocol
        };
      }

      if (event.key === 'Enter') {
        const webview = this.chrome().querySelector(
          '.browser-container .browser.active'
        );
        const input = event.target.value;
        if (checkURL(input).isURL && checkURL(input).hasProtocol) {
          webview.src = input;
        } else if (checkURL(input).isURL && !checkURL(input).hasProtocol) {
          webview.src = `https://${input}`;
        } else {
          webview.src = this.searchUrl.replace(
            '{searchTerms}',
            encodeURI(input)
          );
        }
      } else {
        this.updateSuggestions();
      }
    },

    handleNavbarBackButton: function () {
      const webview = this.browserContainer().querySelector('.browser.active');
      if (webview.canGoBack()) {
        webview.goBack();
      }
    },

    handleNavbarForwardButton: function () {
      const webview = this.browserContainer().querySelector('.browser.active');
      if (webview.canGoForward()) {
        webview.goForward();
      }
    },

    handleNavbarReloadButton: function () {
      const webview = this.browserContainer().querySelector('.browser.active');
      webview.reload();
    },

    handleNavbarHomeButton: function () {
      const webview = this.browserContainer().querySelector('.browser.active');
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
      this.openDropdown('addons');
    },

    handleNavbarOptionsButton: function (event) {
      this.openDropdown('options');
    },

    handleTabsViewCloseButton: function () {
      this.chrome().classList.remove('tabs-view-visible');
      this.tabsView().classList.remove('visible');
    },

    handleIpcMessage: function (event) {
      const webview = this.browserContainer().querySelector('.browser.active');

      const scrollPosition = event.args[0].top;
      let progress = scrollPosition / 80;

      switch (event.channel) {
        case 'scroll':
          if (progress >= 1) {
            progress = 1;
          }
          webview.style.setProperty('--scroll-progress', progress);
          break;

        default:
          break;
      }
    },

    handleContextMenu: function (event) {
      const webview = this.browserContainer().querySelector('.browser.active');
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
      const favicon = this.tablist().querySelector('.active .favicon');
      const gridFavicon = this.tabsViewList().querySelector('.active .favicon');
      favicon.src = event.favicons[0];
      gridFavicon.src = event.favicons[0];
    },

    handlePageTitleUpdated: function (event) {
      const title = this.tablist().querySelector('.active .title');
      const gridTitle = this.tabsViewList().querySelector('.active .title');
      title.textContent = event.title;
      gridTitle.textContent = event.title;
    },

    handleDidStartNavigation: function () {
      const webview = this.browserContainer().querySelector('.browser.active');
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
      const webview = this.browserContainer().querySelector('.browser.active');
      const color = event.themeColor;
      if (color) {
        webview.dataset.themeColor = (color + 'C0').toLowerCase();
        this.chrome().parentElement.dataset.themeColor = color.substring(0, 7);
        this.chrome().parentElement.style.setProperty('--theme-color', color);
        this.toolbar().style.setProperty(
          '--theme-color',
          (color + 'C0').toLowerCase()
        );

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

    openDropdown: function (dropdownId) {
      if (this.screen) {
        this.screen.classList.add('context-menu-visible');
      } else {
        document.body.classList.add('context-menu-visible');
      }
      this.handleDropdownButtonClick({ dataset: { dropdownId } });

      this.dropdown().style.top =
        this.navbarOptionsButton().offsetTop +
        this.navbarOptionsButton().getBoundingClientRect().height +
        'px';
      if (
        this.dropdown().offsetTop + this.dropdown().offsetHeight >
        window.innerHeight
      ) {
        this.dropdown().style.top =
          this.navbarOptionsButton().offsetTop +
          this.dropdown().offsetHeight +
          'px';
      }

      setTimeout(() => {
        this.dropdown().classList.add('visible');
      });

      this.dropdown().addEventListener('click', () => {
        setTimeout(() => {
          this.dropdown().classList.add('visible');
        });
      });
      document.addEventListener('click', this.hideDropdown.bind(this));

      const pageButtons =
        this.dropdown().querySelectorAll('[data-dropdown-id]');
      pageButtons.forEach((button) => {
        button.addEventListener('click', () =>
          this.handleDropdownButtonClick(button)
        );
      });

      const panels = this.dropdown().querySelectorAll('.dropdown-panel');
      panels.forEach((panel, index) => {
        panel.dataset.index = index;
        panel.classList.add('next');
      });
    },

    hideDropdown: function () {
      document.removeEventListener('click', this.hideDropdown.bind(this));

      if (this.screen) {
        this.screen.classList.remove('context-menu-visible');
      } else {
        document.body.classList.remove('context-menu-visible');
      }
      this.dropdown().classList.remove('visible');
    },

    handleDropdownButtonClick: function (button) {
      const id = button.dataset.dropdownId;
      const selectedPanel = this.dropdown().querySelector(
        '.dropdown-panel.visible'
      );

      this.toggleDropdownPanelVisibility(selectedPanel, id);
    },

    toggleDropdownPanelVisibility: function (selectedPanel, targetPanelId) {
      const targetPanel = this.dropdown().querySelector(
        `.dropdown-panel.${targetPanelId}`
      );

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

      if (targetPanel) {
        targetPanel.classList.toggle('visible');
        if (selectedPanel) {
          targetPanel.classList.toggle(
            'previous',
            selectedPanel.dataset.index <= targetPanel.dataset.index
          );
          targetPanel.classList.toggle(
            'next',
            selectedPanel.dataset.index >= targetPanel.dataset.index
          );
        }
        this.dropdown().style.height =
          targetPanel.getBoundingClientRect().height + 'px';
      }
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
