!(function (exports) {
  'use strict';

  let _id = 0;
  let focusedWindow;

  function AppWindow(manifestUrl, configuration) {
    if (manifestUrl) {
      this.manifestUrl = manifestUrl;
      this.create(manifestUrl, configuration);
    }
  }

  AppWindow.prototype = {
    _id: 0,

    screen: document.getElementById('screen'),
    wallpapersContainer: document.getElementById('wallpapers'),
    containerElement: document.getElementById('windows'),
    snapOverlay: document.getElementById('window-snap'),
    statusbar: document.getElementById('statusbar'),
    softwareButtons: document.getElementById('software-buttons'),
    keyboard: document.getElementById('keyboard'),
    softwareBackButton: document.getElementById('software-back-button'),
    softwareHomeButton: document.getElementById('software-home-button'),
    bottomPanel: document.getElementById('bottom-panel'),
    dock: document.getElementById('dock'),

    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme', 'addon'],
    OPEN_ANIMATION: 'expand',
    CLOSE_ANIMATION: 'shrink',
    CLOSE_TO_HOMESCREEN_ANIMATION: 'shrink-to-homescreen',
    DOCK_ICON_SIZE: 40,
    SPLASH_ICON_SIZE: 60,
    UNDRAGGABLE_ELEMENTS: ['A', 'BUTTON', 'INPUT', 'LI', 'WEBVIEW'],

    element: null,
    chrome: null,
    namespaceID: null,
    timeoutID: null,
    isDragging: false,
    isResizing: false,
    resizingWindow: null,
    startX: null,
    startY: null,
    startWidth: null,
    startHeight: null,
    offsetX: null,
    offsetY: null,

    getFocusedWindow: function () {
      return focusedWindow;
    },

    /**
     * Creates the app window with specified manifest URL and configuration
     *
     * Example:
     * ```js
     * const appWindow = new AppWindow('http://settings.localhost:8081/manifest.json', {});
     * ```
     * @param {String} manifestUrl
     * @param {Object} options
     * @returns null
     */
    create: async function (manifestUrl, options = {}) {
      // Check if a window with the same manifest URL already exists
      const existingWindow = this.containerElement.querySelector(`[data-manifest-url="${manifestUrl}"]`);
      if (existingWindow) {
        if (options.animationVariables) {
          // Update transform origin if animation variables are provided
          this.updateTransformOrigin(existingWindow, options.animationVariables);
        }
        // Unminimize the existing window and return
        Webapps.getWindowById(existingWindow.id).unminimize();
        return;
      }

      let manifest = await this.fetchManifest(manifestUrl);
      if (options.entryId) {
        manifest = manifest.entry_points[options.entryId];
        console.log(manifest);
      }

      const namespaceID = `appframe${_id}`;
      this.namespaceID = manifest.role === 'homescreen' ? 'homescreen' : namespaceID;
      _id++;

      const fragment = document.createDocumentFragment();

      // Create and initialize the window container
      const windowDiv = this.createWindowContainer(fragment, manifest, namespaceID, options.animationVariables);
      windowDiv.dataset.manifestUrl = manifestUrl;
      windowDiv.addEventListener('mousedown', () => this.focus());
      windowDiv.addEventListener('touchstart', () => this.focus());
      windowDiv.addEventListener('contextmenu', (event) => this.handleWindowContextMenu(event, windowDiv));
      this.element = windowDiv;

      // Create dock icon
      if (!this.HIDDEN_ROLES.includes(manifest.role)) {
        this.createDockIcon(manifestUrl, manifest.icons);
      }

      // Create a splash screen with an icon
      this.createSplashScreen(windowDiv, manifest.icons, manifestUrl);

      if (window.deviceType === 'desktop') {
        this.createWindowedWindow(windowDiv, manifest, namespaceID, options);
      }

      const url = new URL(manifestUrl);
      let targetUrl = url.origin + manifest.launch_path || manifest.start_url;
      if (manifest.chrome && manifest.chrome.navigation) {
        if (options.url) {
          targetUrl = options.url;
        }
      }

      // Create chrome container and initialize the browser
      const chromeContainer = this.createChromeContainer(windowDiv);
      this.initializeBrowser(chromeContainer, targetUrl, manifest.chrome?.navigation || false);

      this.containerElement.appendChild(fragment);

      // Focus the app window
      this.focus();
      document.addEventListener('mousemove', this.onPointerMove.bind(this));
      document.addEventListener('touchmove', this.onPointerMove.bind(this));
      document.addEventListener('mouseup', this.onPointerUp.bind(this));
      document.addEventListener('touchend', this.onPointerUp.bind(this));
      document.addEventListener('mousemove', this.resize.bind(this));
      document.addEventListener('touchmove', this.resize.bind(this));
      document.addEventListener('mouseup', this.stopResize.bind(this));
      document.addEventListener('touchend', this.stopResize.bind(this));
    },

    handleWindowContextMenu: function (event) {
      event.preventDefault();
      event.stopPropagation();

      const x = event.clientX;
      const y = event.clientY;

      const menu = [
        {
          name: 'Close',
          l10nId: 'windowMenu-close',
          icon: 'windowmanager-close',
          onclick: () => this.close()
        },
        {
          name: 'Maximize',
          l10nId: 'windowMenu-maximize',
          icon: 'windowmanager-maximize',
          onclick: () => this.maximize()
        },
        {
          name: 'Minimize',
          l10nId: 'windowMenu-minimize',
          icon: 'windowmanager-minimize',
          onclick: () => this.minimize()
        },
        { type: 'separator' },
        {
          name: 'Shade',
          l10nId: 'windowMenu-shade',
          icon: 'shade',
          onclick: () => this.shade(true)
        },
        { type: 'separator' },
        {
          name: 'Close Forcefully',
          l10nId: 'windowMenu-closeForcefully',
          icon: 'forbidden',
          onclick: () => this.close(true)
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      requestAnimationFrame(() => {
        ContextMenu.show(x, y, menu);
      });
    },

    fetchManifest: async function (manifestUrl) {
      try {
        const response = await fetch(manifestUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch manifest: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching manifest:', error);
      }
    },

    updateTransformOrigin: function (element, animationVariables) {
      element.style.transformOrigin = `${animationVariables.xPos}px ${animationVariables.yPos}px`;
      element.style.setProperty('--icon-pos-x', animationVariables.iconXPos + 'px');
      element.style.setProperty('--icon-pos-y', animationVariables.iconYPos + 'px');
      element.style.setProperty('--icon-scale-x', animationVariables.iconXScale);
      element.style.setProperty('--icon-scale-y', animationVariables.iconYScale);
    },

    createDockIcon: function (manifestUrl, icons) {
      const icon = document.createElement('div');
      icon.classList.add('icon');
      icon.dataset.manifestUrl = manifestUrl;
      icon.onclick = () => this.focus();
      this.dock.appendChild(icon);

      // Add icon image
      const iconImage = document.createElement('img');
      this.addIconImage(iconImage, icons, this.DOCK_ICON_SIZE, manifestUrl);
      icon.appendChild(iconImage);

      // Add animation class
      this.addAnimationClass(icon, this.OPEN_ANIMATION);
    },

    createWindowContainer: function (fragment, manifest, namespaceID, animationVariables) {
      const windowDiv = document.createElement('div');
      windowDiv.id = manifest.role === 'homescreen' ? 'homescreen' : namespaceID;
      windowDiv.classList.add('appframe');

      if (manifest.role === 'homescreen') {
        this.homescreenElement = windowDiv;
      }

      if (manifest.statusbar && manifest.statusbar !== 'normal') {
        windowDiv.classList.add(manifest.statusbar);
      }

      if (manifest.display && manifest.display !== 'standalone') {
        windowDiv.classList.add(manifest.display);
      }

      if (manifest.transparent) {
        windowDiv.classList.add('transparent');
      }

      if (animationVariables) {
        this.updateTransformOrigin(windowDiv, animationVariables);
      }

      fragment.appendChild(windowDiv);

      // Add animation class
      this.addAnimationClass(windowDiv, this.OPEN_ANIMATION);
      return windowDiv;
    },

    createSplashScreen: function (windowDiv, icons, manifestUrl) {
      const splashScreen = document.createElement('div');
      splashScreen.classList.add('splashscreen');
      windowDiv.appendChild(splashScreen);
      const splashScreenIcon = document.createElement('img');
      splashScreenIcon.classList.add('icon');
      splashScreen.appendChild(splashScreenIcon);
      this.addIconImage(splashScreenIcon, icons, this.SPLASH_ICON_SIZE, manifestUrl);
    },

    createWindowedWindow: function (windowDiv, manifest, namespaceID, options) {
      windowDiv.classList.add('window');
      windowDiv.style.left = manifest.window_bounds?.left || '3.6rem';
      windowDiv.style.top = manifest.window_bounds?.top || '2.4rem';
      windowDiv.style.width = manifest.window_bounds?.width || '76.8rem';
      windowDiv.style.height = manifest.window_bounds?.height || '60rem';

      // Create titlebar and its buttons
      this.createTitlebar(windowDiv, namespaceID);

      // Create resize handlers
      this.createResizeHandlers(windowDiv);
    },

    createTitlebar: function (windowDiv, namespaceID) {
      const titlebar = document.createElement('div');
      titlebar.classList.add('titlebar');
      windowDiv.appendChild(titlebar);

      const titlebarGrippy = document.createElement('div');
      titlebarGrippy.classList.add('titlebar-grippy');
      titlebarGrippy.addEventListener('mousedown', this.onPointerDown.bind(this));
      titlebarGrippy.addEventListener('touchstart', this.onPointerDown.bind(this));
      titlebar.appendChild(titlebarGrippy);

      const titlebarButtons = document.createElement('div');
      titlebarButtons.classList.add('titlebar-buttons');
      titlebar.appendChild(titlebarButtons);

      const closeButton = document.createElement('button');
      closeButton.classList.add('close-button');
      closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      });
      titlebarButtons.appendChild(closeButton);

      const resizeButton = document.createElement('button');
      resizeButton.classList.add('resize-button');
      resizeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.maximize();
      });
      titlebarButtons.appendChild(resizeButton);

      const minimizeButton = document.createElement('button');
      minimizeButton.classList.add('minimize-button');
      minimizeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.minimize();
      });
      titlebarButtons.appendChild(minimizeButton);
    },

    createResizeHandlers: function (windowDiv) {
      const resizeHandlers = [];

      // Create and append the resize handlers in all directions
      for (let i = 0; i < 9; i++) {
        const resizeHandler = document.createElement('div');
        resizeHandler.classList.add('resize-handler');
        windowDiv.appendChild(resizeHandler);
        resizeHandlers.push(resizeHandler);
      }

      // Set the cursor style for each resize handler
      resizeHandlers[0].classList.add('nw-resize');
      resizeHandlers[1].classList.add('n-resize');
      resizeHandlers[2].classList.add('ne-resize');
      resizeHandlers[3].classList.add('w-resize');
      resizeHandlers[4].classList.add('e-resize');
      resizeHandlers[5].classList.add('sw-resize');
      resizeHandlers[6].classList.add('s-resize');
      resizeHandlers[7].classList.add('se-resize');

      // Attach event listeners to each resize handler
      for (let index = 0, length = resizeHandlers.length; index < length; index++) {
        const resizeHandler = resizeHandlers[index];

        resizeHandler.addEventListener('mousedown', this.startResize.bind(this));
        resizeHandler.addEventListener('touchstart', this.startResize.bind(this));
      }
    },

    createChromeContainer: function (windowDiv) {
      const chromeContainer = document.createElement('div');
      chromeContainer.classList.add('chrome');
      windowDiv.appendChild(chromeContainer);
      return chromeContainer;
    },

    initializeBrowser: function (chromeContainer, startUrl, isChromeEnabled) {
      const browser = new Chrome(chromeContainer, startUrl, isChromeEnabled);
      this.chrome = browser;
      Webapps.append({
        appWindow: this,
        chrome: this.chrome,
        namespaceID: this.namespaceID,
        isChromeEnabled,
        manifestUrl: this.manifestUrl,
        startUrl
      });

      chromeContainer.addEventListener('mousedown', this.onPointerDown.bind(this));
      chromeContainer.addEventListener('touchstart', this.onPointerDown.bind(this));
    },

    // Utility methods for adding an icon image and an animation class
    addIconImage: function (element, icons, iconSize, manifestUrl) {
      element.crossOrigin = 'anonymous';
      element.onerror = () => {
        element.src = '/style/images/default.svg';
      };

      const entries = Object.entries(icons);
      for (let index = 0, length = entries.length; index < length; index++) {
        const entry = entries[index];

        if (entry[0] <= iconSize) {
          continue;
        }
        const url = new URL(manifestUrl);
        element.src = url.origin + entry[1];
      }
    },

    addAnimationClass: function (element, animationClass) {
      element.classList.add(animationClass);
      element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
      });
    },

    /**
     * Moves a app window with select app window ID to the foreground and marks it as active
     *
     * Example:
     * ```js
     * AppWindow.focus();
     * ```
     * @returns null
     */
    focus: function () {
      if (this.isDragging) {
        return;
      }
      const dockIcon = this.dock.querySelector(`[data-manifest-url="${this.manifestUrl}"]`);

      this.element.style.transform = '';

      if (this.namespaceID !== 'homescreen') {
        this.wallpapersContainer.classList.add('app-open');
        this.bottomPanel.classList.remove('homescreen');
      } else {
        this.wallpapersContainer.classList.remove('app-open');
        this.bottomPanel.classList.add('homescreen');
      }

      if (this.element.classList.contains('fullscreen')) {
        this.statusbar.classList.add('hidden');
        this.softwareButtons.classList.add('hidden');
      } else {
        this.statusbar.classList.remove('hidden');
        this.softwareButtons.classList.remove('hidden');
      }

      const appWindows = this.containerElement.querySelectorAll('.appframe');
      for (let index = 0, length = appWindows.length; index < length; index++) {
        const element = appWindows[index];
        if (element.classList.contains('overlay')) {
          element.classList.remove('active-as-overlay');
        } else {
          element.classList.remove('active');
        }
      }

      const dockIcons = this.dock.querySelectorAll('.icon');
      for (let index = 0, length = dockIcons.length; index < length; index++) {
        const element = dockIcons[index];
        element.classList.remove('active');
      }

      const webview = this.element.querySelector('.browser-container .browser-view.active > .browser');
      if (this.getFocusedWindow() && this.getFocusedWindow().element) {
        const webviews = this.getFocusedWindow().element.querySelectorAll('.browser-container .browser-view > .browser');
        for (let index1 = 0; index1 < webviews.length; index1++) {
          const webview1 = webviews[index1];
          webview1.addEventListener('dom-ready', () => {
            webview1.send('visibilitystate', 'hidden');
          });
        }
      }
      if (webview) {
        webview.addEventListener('dom-ready', () => {
          webview.send('visibilitystate', 'visible');
        });
      }

      if (this.element.classList.contains('overlay')) {
        this.element.classList.add('active-as-overlay');
      } else {
        this.element.classList.add('active');
      }
      if (dockIcon) {
        dockIcon.classList.add('active');
      }
      focusedWindow = this;

      this.handleThemeColorFocusUpdated();
      Settings.addObserver('video.dark_mode.enabled', () => this.handleThemeColorFocusUpdated());

      if (!this.element.classList.contains('overlay') && this.getFocusedWindow().element && this.getFocusedWindow().element !== this.homescreenElement && this.element !== this.homescreenElement) {
        if (this.element === this.getFocusedWindow().element) {
          return;
        }

        this.getFocusedWindow().element.classList.add('to-left');
        this.getFocusedWindow().element.addEventListener('animationend', () => {
          this.getFocusedWindow().element.classList.remove('from-right');
          this.getFocusedWindow().element.classList.remove('to-left');
        });

        this.element.classList.add('from-right');
        this.element.addEventListener('animationend', () => {
          this.element.classList.remove('from-right');
          this.element.classList.remove('to-left');
        });
      } else {
        if (this.homescreenElement) {
          this.homescreenElement.classList.add('transitioning');
          this.homescreenElement.addEventListener('animationend', () => {
            this.homescreenElement.classList.remove('transitioning');
          });
        }
      }
    },

    /**
     * Closes a app window with select app window ID and kills process
     *
     * Example:
     * ```js
     * AppWindow.close();
     * ```
     * @returns null
     */
    close: function (isFast) {
      if (this.isDragging) {
        return;
      }
      if (this.namespaceID === 'homescreen') {
        return;
      }

      const dockIcon = this.dock.querySelector(`[data-manifest-url="${this.manifestUrl}"]`);
      this.dockIcon = dockIcon;

      if (isFast) {
        this.element.remove();
        if (dockIcon) {
          dockIcon.remove();
        }
      } else {
        this.element.classList.add(this.CLOSE_ANIMATION);
        if (dockIcon) {
          dockIcon.classList.add(this.CLOSE_ANIMATION);
        }
        this.element.addEventListener('animationend', () => {
          this.element.style.transform = '';
          this.element.classList.remove(this.CLOSE_ANIMATION);
          this.element.remove();
          if (dockIcon) {
            dockIcon.classList.remove(this.CLOSE_ANIMATION);
            dockIcon.remove();
          }
          HomescreenLauncher.homescreenWindow.focus();
        });
      }
    },

    minimize: function () {
      if (this.isDragging) {
        return;
      }
      if (this.namespaceID === 'homescreen') {
        return;
      }

      const dockIcon = this.dock.querySelector(`[data-manifest-url="${this.manifestUrl}"]`);

      HomescreenLauncher.homescreenWindow.focus();
      this.element.classList.add(this.CLOSE_TO_HOMESCREEN_ANIMATION);
      if (dockIcon) {
        dockIcon.classList.add('minimized');
      }
      this.element.addEventListener('animationend', () => {
        HomescreenLauncher.homescreenWindow.focus();
      });
      // Focus plays a 0.5s switch animation which could mess up the close animation timer
      this.timeoutID = setTimeout(() => {
        this.element.style.transform = '';
        this.element.classList.remove('active');
        this.element.classList.remove(this.CLOSE_TO_HOMESCREEN_ANIMATION);
      }, 1000);
    },

    unminimize: function () {
      if (this.isDragging) {
        return;
      }
      if (this.namespaceID === 'homescreen') {
        return;
      }

      const dockIcon = this.dock.querySelector(`[data-manifest-url="${this.manifestUrl}"]`);

      if (this.element === this.focusedWindow) {
        return;
      }

      if (dockIcon) {
        dockIcon.classList.remove('minimized');
      }
      this.focus();
      this.element.classList.add(this.OPEN_ANIMATION);
      this.element.addEventListener('animationend', () => {
        this.element.classList.remove(this.OPEN_ANIMATION);
        this.focus();
      });
    },

    maximize: function () {
      if (this.namespaceID === 'homescreen') {
        return;
      }
      this.element.classList.add('transitioning');
      this.element.classList.toggle('maximized');
      this.element.addEventListener('transitionend', () => this.element.classList.remove('transitioning'));
    },

    handleThemeColorFocusUpdated: function () {
      const webview = this.element.querySelector('.browser-container .browser.active');
      let color;
      if (webview) {
        color = webview.dataset.themeColor.substring(0, 7);
      } else {
        return;
      }

      if (color) {
        // Calculate the luminance of the color
        const luminance = this.calculateLuminance(color);

        // If the color is light (luminance > 0.5), add 'light' class to the status bar
        if (luminance > 0.5) {
          this.statusbar.classList.remove('dark');
          this.softwareButtons.classList.remove('dark');
          this.statusbar.classList.add('light');
          this.softwareButtons.classList.add('light');
        } else {
          // Otherwise, remove 'light' class
          this.statusbar.classList.remove('light');
          this.softwareButtons.classList.remove('light');
          this.statusbar.classList.add('dark');
          this.softwareButtons.classList.add('dark');
        }
      } else {
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

    // Attach event listeners for mouse/touch events to handle dragging
    onPointerDown: function (event) {
      if (this.UNDRAGGABLE_ELEMENTS.indexOf(event.target.nodeName) !== -1) {
        return;
      }
      if (window.deviceType !== 'desktop') {
        return;
      }

      event.preventDefault();
      this.containerElement.classList.add('dragging');
      this.isDragging = true;

      this.element.classList.add('transitioning');
      this.element.addEventListener('transitionend', () => this.element.classList.remove('transitioning'));
      this.element.classList.add('dragging');

      // Get initial position
      const initialX = event.pageX || event.touches[0].pageX;
      const initialY = event.pageY || event.touches[0].pageY;

      // Get initial window position
      const initialWindowX = this.element.offsetLeft;
      const initialWindowY = this.element.offsetTop;

      // Calculate the offset between the initial position and the window position
      this.offsetX = initialX - initialWindowX;
      this.offsetY = initialY - initialWindowY;

      // this.element.style.transformOrigin = `${offsetX}px ${offsetY}px`;
    },

    onPointerMove: function (event) {
      if (window.deviceType !== 'desktop') {
        return;
      }
      if (!this.isDragging) {
        return;
      }

      event.preventDefault();
      const x = event.pageX || event.touches[0].pageX;
      const y = event.pageY || event.touches[0].pageY;

      // Calculate the new position of the window
      const newWindowX = x - this.offsetX;
      const newWindowY = Math.max(0, Math.min(window.innerHeight - 64 - 32, y - this.offsetY));

      // Set the new position of the window
      this.element.style.left = newWindowX + 'px';
      this.element.style.top = newWindowY + 'px';

      this.element.classList.remove('snapped');
      if (event.clientX < 15) {
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('left');
      } else if (event.clientX > window.innerWidth - 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('right');
      } else if (event.clientX < window.innerWidth / 3 && event.clientY < 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('top-left');
      } else if (event.clientX > (window.innerWidth / 3) * 2 && event.clientY < 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('top-right');
      } else if (event.clientX < (window.innerWidth / 3) * 2 && event.clientX > window.innerWidth / 3 && event.clientY < 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('cover');
      } else {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.remove('visible');
      }
    },

    onPointerUp: function (event) {
      if (window.deviceType !== 'desktop') {
        return;
      }
      event.preventDefault();
      this.containerElement.classList.remove('dragging');

      this.element.classList.add('transitioning');
      this.element.addEventListener('transitionend', () => this.element.classList.remove('transitioning'));
      this.element.classList.remove('dragging');

      this.isDragging = false;

      this.snapOverlay.classList.remove('left');
      this.snapOverlay.classList.remove('right');
      this.snapOverlay.classList.remove('cover');
      this.snapOverlay.classList.remove('top-left');
      this.snapOverlay.classList.remove('top-right');
      this.snapOverlay.classList.remove('visible');
      if (event.clientX < 15) {
        this.element.style.left = '0';
        this.element.style.top = '0';
        this.element.style.width = '50%';
        this.element.style.height = 'calc(100% - var(--dock-height) - 2rem)';
        this.element.classList.add('snapped');
      } else if (event.clientX > window.innerWidth - 15) {
        this.element.style.left = '50%';
        this.element.style.top = '0';
        this.element.style.width = '50%';
        this.element.style.height = 'calc(100% - var(--dock-height) - 2rem)';
        this.element.classList.add('snapped');
      } else if (event.clientX < window.innerWidth / 3 && event.clientY < 15) {
        this.element.style.left = '0';
        this.element.style.top = '0';
        this.element.style.width = '50%';
        this.element.style.height = 'calc((100% - var(--dock-height) - 2rem) / 2)';
        this.element.classList.add('snapped');
      } else if (event.clientX > (window.innerWidth / 3) * 2 && event.clientY < 15) {
        this.element.style.left = '50%';
        this.element.style.top = '0';
        this.element.style.width = '50%';
        this.element.style.height = 'calc((100% - var(--dock-height) - 2rem) / 2)';
        this.element.classList.add('snapped');
      } else if (event.clientX < (window.innerWidth / 3) * 2 && event.clientX > window.innerWidth / 3 && event.clientY < 15) {
        this.maximize();
      }
    },

    startResize: function (event) {
      event.preventDefault();
      this.isResizing = true;
      this.containerElement.classList.add('dragging');
      this.resizingWindow = this.element;
      this.resizingGripper = event.target;

      this.startX = event.pageX || event.touches[0].pageX;
      this.startY = event.pageY || event.touches[0].pageY;
      this.startWidth = this.resizingWindow.offsetWidth;
      this.startHeight = this.resizingWindow.offsetHeight;
    },

    resize: function (event, gripper) {
      event.preventDefault();
      if (!this.isResizing) {
        return;
      }

      const currentX = event.pageX || event.touches[0].pageX;
      const currentY = event.pageY || event.touches[0].pageY;

      let width = this.startWidth;
      let height = this.startHeight;
      let left = this.resizingWindow.offsetLeft;
      let top = this.resizingWindow.offsetTop;

      if (gripper.classList.contains('nw-resize')) {
        // Top Left
        width = this.startWidth + (this.startX - currentX);
        height = this.startHeight + (this.startY - currentY);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (gripper.classList.contains('n-resize')) {
        // Top
        height = this.startHeight + (this.startY - currentY);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (gripper.classList.contains('ne-resize')) {
        // Top Right
        width = this.startWidth + (currentX - this.startX);
        height = this.startHeight + (this.startY - currentY);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (gripper.classList.contains('w-resize')) {
        // Left
        width = this.startWidth + (this.startX - currentX);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
      } else if (gripper.classList.contains('e-resize')) {
        // Right
        width = this.startWidth + (currentX - this.startX);
      } else if (gripper.classList.contains('sw-resize')) {
        // Bottom Left
        width = this.startWidth + (this.startX - currentX);
        height = this.startHeight + (currentY - this.startY);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
      } else if (gripper.classList.contains('s-resize')) {
        // Bottom
        height = this.startHeight + (currentY - this.startY);
      } else if (gripper.classList.contains('se-resize')) {
        // Bottom Right
        width = this.startWidth + (currentX - this.startX);
        height = this.startHeight + (currentY - this.startY);
      }

      // Update the position and dimensions of the window
      this.resizingWindow.style.width = `${width}px`;
      this.resizingWindow.style.height = `${height}px`;
      this.resizingWindow.style.left = `${left}px`;
      this.resizingWindow.style.top = `${top}px`;
    },

    stopResize: function (event) {
      event.preventDefault();
      this.isResizing = false;
      this.containerElement.classList.remove('dragging');
    }
  };

  exports.AppWindow = AppWindow;

  const AppWindowExtended = {
    screen: document.getElementById('screen'),
    containerElement: document.getElementById('windows'),
    softwareButtons: document.getElementById('software-buttons'),
    softwareBackButton: document.getElementById('software-back-button'),
    softwareHomeButton: document.getElementById('software-home-button'),

    init: function () {
      this.containerElement.addEventListener('contextmenu', this.handleDesktopContextMenu.bind(this));
      if (window.deviceType === 'desktop') {
        this.softwareButtons.addEventListener('contextmenu', this.handleDesktopContextMenu.bind(this));
      }

      this.softwareBackButton.addEventListener('click', this.onButtonClick.bind(this));
      this.softwareHomeButton.addEventListener('click', this.onButtonClick.bind(this));
    },

    handleDesktopContextMenu: function (event) {
      event.preventDefault();

      const x = event.clientX;
      const y = event.clientY;

      const trayMenu = [
        {
          name: 'Settings',
          l10nId: 'desktopMenu-settings',
          icon: 'settings',
          onclick: () => {
            const appWindow = new AppWindow('http://settings.localhost:8081/manifest.json', {});
          }
        }
      ];

      const desktopMenu = [
        {
          name: 'Widgets',
          l10nId: 'desktopMenu-widgets',
          icon: 'groups',
          onclick: () => {}
        },
        {
          name: 'Open Folder',
          l10nId: 'desktopMenu-openFolder',
          icon: 'folder',
          onclick: () => {}
        },
        { type: 'separator' },
        {
          name: 'Settings',
          l10nId: 'desktopMenu-settings',
          icon: 'settings',
          onclick: () => {
            const appWindow = new AppWindow('http://settings.localhost:8081/manifest.json', {});
          }
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      requestAnimationFrame(() => {
        if (event.target === this.softwareButtons) {
          ContextMenu.show(x, y, trayMenu);
        } else if (event.target === this.containerElement) {
          ContextMenu.show(x, y, desktopMenu);
        }
      });
    },

    onButtonClick: function (event) {
      switch (event.target) {
        case this.softwareBackButton:
          if (!this.screen.classList.contains('keyboard-visible')) {
            const webview = AppWindow.getFocusedWindow().element.querySelector('.browser-container .browser.active');
            if (webview.canGoBack()) {
              webview.goBack();
            } else {
              this.close();
            }
          } else {
            this.screen.classList.remove('keyboard-visible');
            this.keyboard.classList.remove('visible');
          }
          break;

        case this.softwareHomeButton:
          this.minimize();
          break;

        default:
          break;
      }
    }
  };

  AppWindowExtended.init();
})(window);
