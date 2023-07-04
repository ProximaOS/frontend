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

  webviews: function() {
    return this.chrome.querySelector('.webviews');
  },

  init: function(chromeElement) {
    if (chromeElement) {
      this.chrome = chromeElement;
    }
    this.openNewTab(false);

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
    this.webviews().appendChild(webview);

    webview.addEventListener('context-menu', this.handleContextMenu.bind(this));
    webview.addEventListener('page-favicon-updated', this.handlePageFaviconUpdated.bind(this));
    webview.addEventListener('page-title-updated', this.handlePageTitleUpdated.bind(this));
    webview.addEventListener('did-start-navigation', this.handleDidStartNavigation.bind(this));

    const focus = () => {
      var tabs = this.chrome.querySelectorAll('.tablist li');
      tabs.forEach(function(tab) {
        tab.classList.remove('active');
      });

      var webviews = this.chrome.querySelectorAll('.webviews webview');
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
      var webview = this.chrome.querySelector('.webviews webview.active');
      var url = event.target.value;
      webview.src = url;
    }
  },

  handleNavbarBackButton: function() {
    var webview = this.chrome.querySelector('.webviews webview.active');
    if (webview.canGoBack()) {
      webview.goBack();
    }
  },

  handleNavbarForwardButton: function() {
    var webview = this.chrome.querySelector('.webviews webview.active');
    if (webview.canGoForward()) {
      webview.goForward();
    }
  },

  handleNavbarReloadButton: function() {
    var webview = this.chrome.querySelector('.webviews webview.active');
    webview.reload();
  },

  handleNavbarHomeButton: function() {
    var webview = this.chrome.querySelector('.webviews webview.active');
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
    var webview = this.chrome.querySelector('.webviews webview.active');
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
};

// Initialize the Browser object
Browser.init();
