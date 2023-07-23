const Browser = {
  _id: 0,

  DEFAULT_URL: "https://www.duckduckgo.com",

  chrome: document.getElementById("chrome"),
  statusbar: document.getElementById("statusbar"),
  softwareButtons: document.getElementById("software-buttons"),

  tablist: function () {
    return this.chrome.querySelector(".tablist");
  },

  profileButton: function () {
    return this.chrome.querySelector(".profile-button");
  },

  addButton: function () {
    return this.chrome.querySelector(".add-button");
  },

  navbarBackButton: function () {
    return this.chrome.querySelector(".navbar-back-button");
  },

  navbarForwardButton: function () {
    return this.chrome.querySelector(".navbar-forward-button");
  },

  navbarReloadButton: function () {
    return this.chrome.querySelector(".navbar-reload-button");
  },

  navbarHomeButton: function () {
    return this.chrome.querySelector(".navbar-home-button");
  },

  navbarTabsButton: function () {
    return this.chrome.querySelector(".navbar-tabs-button");
  },

  navbarOptionsButton: function () {
    return this.chrome.querySelector(".navbar-options-button");
  },

  urlbar: function () {
    return this.chrome.querySelector(".urlbar");
  },

  urlbarInput: function () {
    return this.chrome.querySelector(".urlbar-input");
  },

  urlbarDisplayUrl: function () {
    return this.chrome.querySelector(".urlbar-display-url");
  },

  browserContainer: function () {
    return this.chrome.querySelector(".browser-container");
  },

  tabsView: function () {
    return this.chrome.querySelector(".tabs-view");
  },

  tabsViewCloseButton: function () {
    return this.chrome.querySelector(".tabs-view-close-button");
  },

  tabsViewAddButton: function () {
    return this.chrome.querySelector(".tabs-view-add-button");
  },

  tabsViewList: function () {
    return this.chrome.querySelector(".tabs-view .grid");
  },

  init: function (chromeElement, url, isChromeEnabled) {
    if (chromeElement) {
      this.chrome = chromeElement;
      this.chrome.innerHTML = `
        <div class="toolbar">
          <div class="tablist-holder">
            <button class="profile-button" data-icon="user" data-l10n-id="profile-button">
              <img src="" alt="" class="avatar">
            </button>
            <button class="sidetabs-button" data-icon="browser-sidetabs" data-l10n-id="tablist-sideTabsButton"></button>
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
      `;
    }
    if (isChromeEnabled) {
      this.chrome.classList.add("visible");
    }
    if (window.matchMedia("(prefers-color-scheme: light)")) {
      this.statusbar.classList.add("light");
      this.softwareButtons.classList.add("light");
      this.chrome.classList.add("light");
      this.chrome.parentElement.classList.add("light");
    } else if (window.matchMedia("(prefers-color-scheme: dark)")) {
      this.statusbar.classList.add("dark");
      this.softwareButtons.classList.add("dark");
      this.chrome.classList.add("dark");
      this.chrome.parentElement.classList.add("dark");
    }
    this.chrome.dataset.id = 0;
    this.DEFAULT_URL = url;
    this.openNewTab(false, url);

    var avatarImage = this.profileButton().querySelector('.avatar');
    if (OrchidServices) {
      if (OrchidServices.isUserLoggedIn()) {
        OrchidServices.getWithUpdate(`profile/${OrchidServices.userId()}`, function (data) {
          avatarImage.src = data.profile_picture;
        });
      }
    }

    this.addButton().addEventListener(
      "click",
      this.openNewTab.bind(this, false)
    );
    this.urlbarInput().addEventListener(
      "keydown",
      this.handleUrlbarInputKeydown.bind(this)
    );
    this.navbarBackButton().addEventListener(
      "click",
      this.handleNavbarBackButton.bind(this)
    );
    this.navbarForwardButton().addEventListener(
      "click",
      this.handleNavbarForwardButton.bind(this)
    );
    this.navbarReloadButton().addEventListener(
      "click",
      this.handleNavbarReloadButton.bind(this)
    );
    this.navbarHomeButton().addEventListener(
      "click",
      this.handleNavbarHomeButton.bind(this)
    );
    this.navbarTabsButton().addEventListener(
      "click",
      this.handleNavbarTabsButton.bind(this)
    );
    this.navbarOptionsButton().addEventListener(
      "click",
      this.handleNavbarOptionsButton.bind(this)
    );
    this.tabsViewCloseButton().addEventListener(
      "click",
      this.handleTabsViewCloseButton.bind(this)
    );
    this.tabsViewAddButton().addEventListener(
      "click",
      this.openNewTab.bind(this)
    );
  },

  openNewTab: function (isPrivate, url) {
    var id = `${this.chrome.nodeName}#${this.chrome.id}.${this.chrome.className}`;
    this.chrome.dataset.id++;
    this.navbarTabsButton().dataset.amount = this.chrome.dataset.id;

    var tab = document.createElement("li");
    this.tablist().appendChild(tab);

    var favicon = document.createElement("img");
    favicon.classList.add("favicon");
    tab.appendChild(favicon);

    var title = document.createElement("span");
    title.classList.add("title");
    tab.appendChild(title);

    var closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.dataset.icon = "close";
    tab.appendChild(closeButton);

    var gridTab = document.createElement("div");
    gridTab.classList.add("tab");
    this.tabsViewList().appendChild(gridTab);

    var gridHeader = document.createElement("div");
    gridHeader.classList.add("header");
    gridTab.appendChild(gridHeader);

    var gridFavicon = document.createElement("img");
    gridFavicon.classList.add("favicon");
    gridHeader.appendChild(gridFavicon);

    var gridTitle = document.createElement("span");
    gridTitle.classList.add("title");
    gridHeader.appendChild(gridTitle);

    var gridCloseButton = document.createElement("button");
    gridCloseButton.classList.add("close-button");
    gridCloseButton.dataset.icon = "close";
    gridHeader.appendChild(gridCloseButton);

    var gridPreview = document.createElement("img");
    gridPreview.classList.add("preview");
    gridTab.appendChild(gridPreview);

    var webview = document.createElement("webview");
    webview.src = url || this.DEFAULT_URL;
    webview.classList.add("browser");
    webview.nodeintegration = true;
    webview.nodeintegrationinsubframes = true;
    webview.disablewebsecurity = true;
    webview.webpreferences = "contextIsolation=false";
    webview.useragent = navigator.userAgent;
    webview.preload = `file://${process
      .cwd()
      .replaceAll("\\", "/")}/preload.js`;
    this.browserContainer().appendChild(webview);

    webview.addEventListener("context-menu", this.handleContextMenu.bind(this));
    webview.addEventListener(
      "page-favicon-updated",
      this.handlePageFaviconUpdated.bind(this)
    );
    webview.addEventListener(
      "page-title-updated",
      this.handlePageTitleUpdated.bind(this)
    );
    webview.addEventListener(
      "did-start-navigation",
      this.handleDidStartNavigation.bind(this)
    );
    webview.addEventListener(
      "did-change-theme-color",
      this.handleThemeColorUpdated.bind(this)
    );

    const pattern = /^http:\/\/.*\.localhost:8081\//;
    const cssURL = `http://shared.localhost:${location.port}/style/webview.css`;
    const jsURL = `http://shared.localhost:${location.port}/js/webview.js`;

    webview.addEventListener("did-stop-loading", () => {
      var splashElement =
        this.chrome.parentElement.querySelector(".splashscreen");
      if (splashElement) {
        splashElement.classList.add("hidden");
      }
    });

    [
      "did-start-loading",
      "did-start-navigation",
      "did-stop-loading",
      "dom-ready",
    ].forEach((eventType) => {
      webview.addEventListener(eventType, () => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", cssURL, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const cssContent = xhr.responseText;
            webview.insertCSS(cssContent);
          } else if (xhr.readyState === 4) {
            console.error("Failed to fetch CSS:", xhr.status, xhr.statusText);
          }
        };
        xhr.send();

        const xhr1 = new XMLHttpRequest();
        xhr1.open("GET", jsURL, true);
        xhr1.onreadystatechange = function () {
          if (xhr1.readyState === 4 && xhr1.status === 200) {
            const jsContent = xhr1.responseText;
            webview.executeJavaScript(jsContent);
          } else if (xhr1.readyState === 4) {
            console.error("Failed to fetch JS:", xhr1.status, xhr1.statusText);
          }
        };
        xhr1.send();

        if (pattern.test(webview.getURL())) {
          webview.nodeintegration = true;
          webview.nodeintegrationinsubframes = true;
          webview.disablewebsecurity = true;
          webview.webpreferences = "contextIsolation=false";
        } else {
          webview.nodeintegration = false;
          webview.nodeintegrationinsubframes = false;
          webview.disablewebsecurity = false;
          webview.webpreferences = "contextIsolation=true";
        }

        if (!isPrivate) {
          webview.capturePage().then((data) => {
            gridPreview.src = data.toDataURL();
          });
        }
      });
    });

    const focus = () => {
      var tabs = this.chrome.querySelectorAll(".tablist li");
      tabs.forEach(function (tab) {
        tab.classList.remove("active");
      });

      var gridTabs = this.chrome.querySelectorAll(".tabs-view .grid .tab");
      gridTabs.forEach(function (gridTab) {
        gridTab.classList.remove("active");
      });

      var webviews = this.chrome.querySelectorAll(".browser-container webview");
      webviews.forEach(function (webview) {
        webview.classList.remove("active");
      });

      tab.classList.add("active");
      gridTab.classList.add("active");
      webview.classList.add("active");
    };

    focus();
    tab.addEventListener("click", focus.bind(this));
    gridTab.addEventListener("click", focus.bind(this));
    closeButton.addEventListener("click", () => {
      this.chrome.dataset.id--;
      this.navbarTabsButton().dataset.amount = this.chrome.dataset.id;

      tab.remove();
      gridTab.remove();
      webview.remove();
    });
    gridCloseButton.addEventListener("click", () => {
      this.chrome.dataset.id--;
      this.navbarTabsButton().dataset.amount = this.chrome.dataset.id;

      tab.remove();
      gridTab.remove();
      webview.remove();
    });
  },

  handleUrlbarInputKeydown: function (event) {
    if (event.key === "Enter") {
      var activeTab = this.chrome.querySelector(".tablist li.active");
      var webview = this.chrome.querySelector(
        ".browser-container .browser.active"
      );
      var url = event.target.value;
      webview.src = url;
    }
  },

  handleNavbarBackButton: function () {
    var webview = this.chrome.querySelector(
      ".browser-container .browser.active"
    );
    if (webview.canGoBack()) {
      webview.goBack();
    }
  },

  handleNavbarForwardButton: function () {
    var webview = this.chrome.querySelector(
      ".browser-container .browser.active"
    );
    if (webview.canGoForward()) {
      webview.goForward();
    }
  },

  handleNavbarReloadButton: function () {
    var webview = this.chrome.querySelector(
      ".browser-container .browser.active"
    );
    webview.reload();
  },

  handleNavbarHomeButton: function () {
    var webview = this.chrome.querySelector(
      ".browser-container .browser.active"
    );
    webview.src = this.DEFAULT_URL;
  },

  handleNavbarTabsButton: function () {
    this.tabsView().classList.toggle("visible");
  },

  handleNavbarOptionsButton: function (event) {
    const rtl = document.dir === "rtl";
    const x = rtl ? 5 : window.innerWidth - 5;
    setTimeout(() => {
      contextMenu.show(x, 90, [
        {
          name: "New Tab",
          icon: "add",
          onclick: this.openNewTab.bind(this, false),
        },
        {
          name: "New Private Tab",
          icon: "add",
          onclick: this.openNewTab.bind(this, true),
        },
        { type: "separator" },
        {
          name: "Library",
          icon: "browser-library",
          onclick: null,
        },
        {
          name: "Add-Ons",
          icon: "browser-addons",
          onclick: null,
        },
        {
          name: "Settings",
          icon: "settings",
          onclick: null,
        },
      ]);
    }, 100);
  },

  handleTabsViewCloseButton: function () {
    this.tabsView().classList.remove("visible");
  },

  handleContextMenu: function (event) {
    var webview = this.chrome.querySelector(
      ".browser-container .browser.active"
    );
    contextMenu.show(event.params.x, event.params.y, [
      {
        name: "Back",
        icon: "browser-back",
        disabled: !webview.canGoBack(),
        onclick: () => {
          webview.focus();
          webview.goBack();
        },
      },
      {
        name: "Forward",
        icon: "browser-forward",
        disabled: !webview.canGoForward(),
        onclick: () => {
          webview.focus();
          webview.goForward();
        },
      },
      { type: "separator" },
      {
        name: "Copy",
        icon: "textselection-copy",
        disabled: !event.params.editFlags.canCopy,
        onclick: () => {
          webview.focus();
          webview.copy();
        },
      },
      {
        name: "Cut",
        icon: "textselection-cut",
        disabled: !event.params.editFlags.canCut,
        onclick: () => {
          webview.focus();
          webview.cut();
        },
      },
      {
        name: "Paste",
        icon: "textselection-paste",
        disabled: !event.params.editFlags.canPaste,
        onclick: () => {
          webview.focus();
          webview.paste();
        },
      },
      {
        name: "Select All",
        icon: "textselection-selectall",
        disabled: !event.params.editFlags.canSelectAll,
        onclick: () => {
          webview.focus();
          webview.selectAll();
        },
      },
      { type: "separator" },
      {
        name: "Delete",
        icon: "delete",
        disabled: !event.params.editFlags.canDelete,
        onclick: () => {
          webview.focus();
          webview.delete();
        },
      },
      { type: "separator" },
      {
        name: "Inspect Element",
        icon: "edit",
        onclick: () => {
          webview.focus();
          webview.openDevTools();
        },
      },
    ]);
  },

  handlePageFaviconUpdated: function (event) {
    var favicon = this.chrome.querySelector(".tablist .active .favicon");
    var gridFavicon = this.chrome.querySelector(".tabs-view .active .favicon");
    favicon.src = event.favicons[0];
    gridFavicon.src = event.favicons[0];
  },

  handlePageTitleUpdated: function (event) {
    var title = this.chrome.querySelector(".tablist .active .title");
    var gridTitle = this.chrome.querySelector(".tabs-view .active .title");
    title.textContent = event.title;
    gridTitle.textContent = event.title;
  },

  handleDidStartNavigation: function () {
    var webview = this.chrome.querySelector(
      ".browser-container .browser.active"
    );
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

  handleThemeColorUpdated: function (event) {
    var webview = this.chrome.querySelector(
      ".browser-container .browser.active"
    );
    const color = event.themeColor;
    webview.dataset.themeColor = color;
    this.chrome.parentElement.style.setProperty("--theme-color", color);

    // Calculate the luminance of the color
    const luminance = this.calculateLuminance(color);

    // If the color is light (luminance > 0.5), add 'light' class to the status bar
    if (luminance > 0.5) {
      this.chrome.classList.add("light");
      this.chrome.parentElement.classList.add("light");
      this.statusbar.classList.add("light");
      this.softwareButtons.classList.add("light");
      this.chrome.classList.remove("dark");
      this.chrome.parentElement.classList.remove("dark");
      this.statusbar.classList.remove("dark");
      this.softwareButtons.classList.remove("dark");
    } else {
      // Otherwise, remove 'light' class
      this.chrome.classList.remove("light");
      this.chrome.parentElement.classList.remove("light");
      this.statusbar.classList.remove("light");
      this.softwareButtons.classList.remove("light");
      this.chrome.classList.add("dark");
      this.chrome.parentElement.classList.add("dark");
      this.statusbar.classList.add("dark");
      this.softwareButtons.classList.add("dark");
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
