!(function (exports) {
  'use strict';

  const AppWindow = {
    _id: 0,

    screen: document.getElementById('screen'),
    wallpapers: document.getElementById('wallpapers'),
    containerElement: document.getElementById('windows'),
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
    UNDRAGGABLE_ELEMENTS: [
      'A',
      'BUTTON',
      'INPUT',
      'LI',
      'WEBVIEW'
    ],

    timeoutID: null,
    isDragging: false,
    isResizing: false,
    resizingWindow: null,
    startX: null,
    startY: null,
    startWidth: null,
    startHeight: null,

    /**
     * The function that initiates windows and adds the event listeners.
     */
    init: function () {
      this.containerElement.addEventListener('contextmenu', this.handleDesktopContextMenu.bind(this));

      this.softwareBackButton.addEventListener('click', this.onButtonClick.bind(this));
      this.softwareHomeButton.addEventListener('click', this.onButtonClick.bind(this));
    },

    handleDesktopContextMenu: function (event) {
      event.preventDefault();

      const x = event.clientX;
      const y = event.clientY;

      const menu = [
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
          onclick: () => {}
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      setTimeout(() => {
        ContextMenu.show(x, y, menu);
      }, 16);
    },

    /**
     * Creates the app window with specified manifest URL and configuration
     *
     * Example:
     * ```js
     * AppWindow.create('http://settings.localhost:8081/manifest.json', {});
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
        this.unminimize(existingWindow.id);
        return;
      }

      const manifest = await this.fetchManifest(manifestUrl);

      const windowId = `appframe${AppWindow._id}`;
      AppWindow._id++;

      // Create and initialize the window container
      const windowDiv = this.createWindowContainer(manifest, windowId, options.animationVariables);
      windowDiv.dataset.manifestUrl = manifestUrl;
      windowDiv.addEventListener('contextmenu', (event) => this.handleWindowContextMenu(event, windowDiv));

      // Create dock icon
      if (!this.HIDDEN_ROLES.includes(manifest.role)) {
        this.createDockIcon(manifestUrl, windowId, manifest.icons);
      }

      // Create a splash screen with an icon
      this.createSplashScreen(windowDiv, manifest.icons, manifestUrl);

      if (platform() === 'desktop') {
        this.createWindowedWindow(windowDiv, manifest, windowId, options);
      }

      // Create chrome container and initialize the browser
      const chromeContainer = this.createChromeContainer(windowDiv);
      const url = new URL(manifestUrl);
      this.initializeBrowser(windowId, chromeContainer, url.origin + manifest.launch_path || manifest.start_url, manifest.chrome?.navigation || false);
    },

    handleWindowContextMenu: function (event, windowDiv) {
      event.preventDefault();
      event.stopPropagation();

      const appId = windowDiv.id;

      const x = event.clientX;
      const y = event.clientY;

      const menu = [
        {
          name: 'Close',
          l10nId: 'windowMenu-close',
          icon: 'windowmanager-close',
          onclick: () => this.close(appId)
        },
        {
          name: 'Maximize',
          l10nId: 'windowMenu-maximize',
          icon: 'windowmanager-maximize',
          onclick: () => this.maximize(appId)
        },
        {
          name: 'Minimize',
          l10nId: 'windowMenu-minimize',
          icon: 'windowmanager-minimize',
          onclick: () => this.minimize(appId)
        },
        { type: 'separator' },
        {
          name: 'Shade',
          l10nId: 'windowMenu-shade',
          icon: 'shade',
          onclick: () => this.shade(appId, true)
        },
        { type: 'separator' },
        {
          name: 'Close Forcefully',
          l10nId: 'windowMenu-closeForcefully',
          icon: 'forbidden',
          onclick: () => this.close(appId, true)
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      setTimeout(() => {
        ContextMenu.show(x, y, menu);
      }, 16);
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

    createDockIcon: function (manifestUrl, windowId, icons) {
      const icon = document.createElement('div');
      icon.classList.add('icon');
      icon.dataset.manifestUrl = manifestUrl;
      icon.onclick = () => this.focus(windowId);
      this.dock.appendChild(icon);

      // Add icon image
      this.addIconImage(icon, icons, this.DOCK_ICON_SIZE, manifestUrl);

      // Add animation class
      this.addAnimationClass(icon, this.OPEN_ANIMATION);
    },

    createWindowContainer: function (manifest, windowId, animationVariables) {
      const windowDiv = document.createElement('div');
      windowDiv.id = manifest.role === 'homescreen' ? 'homescreen' : windowId;
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

      this.containerElement.appendChild(windowDiv);

      // Focus the app window
      this.focus(windowDiv.id);

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

    createWindowedWindow: function (windowDiv, manifest, windowId, options) {
      windowDiv.classList.add('window');
      windowDiv.style.left = manifest.window_bounds?.left || '3.6rem';
      windowDiv.style.top = manifest.window_bounds?.top || '2.4rem';
      windowDiv.style.width = manifest.window_bounds?.width || '76.8rem';
      windowDiv.style.height = manifest.window_bounds?.height || '60rem';

      // Create titlebar and its buttons
      this.createTitlebar(windowDiv, windowId);

      // Create resize handlers
      this.createResizeHandlers(windowDiv);
    },

    createTitlebar: function (windowDiv, windowId) {
      const titlebar = document.createElement('div');
      titlebar.classList.add('titlebar');
      windowDiv.appendChild(titlebar);

      const titlebarGrippy = document.createElement('div');
      titlebarGrippy.classList.add('titlebar-grippy');
      titlebarGrippy.addEventListener('mousedown', this.startDrag.bind(this, windowId));
      titlebarGrippy.addEventListener('touchstart', this.startDrag.bind(this, windowId));
      titlebar.appendChild(titlebarGrippy);

      const titlebarButtons = document.createElement('div');
      titlebarButtons.classList.add('titlebar-buttons');
      titlebar.appendChild(titlebarButtons);

      const closeButton = document.createElement('button');
      closeButton.classList.add('close-button');
      closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.close(windowId);
      });
      titlebarButtons.appendChild(closeButton);

      const resizeButton = document.createElement('button');
      resizeButton.classList.add('resize-button');
      resizeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.maximize(windowId);
      });
      titlebarButtons.appendChild(resizeButton);

      const minimizeButton = document.createElement('button');
      minimizeButton.classList.add('minimize-button');
      minimizeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.minimize(windowId);
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
      for (let index = 0; index < resizeHandlers.length; index++) {
        const resizeHandler = resizeHandlers[index];

        resizeHandler.addEventListener('mousedown', (event) => this.startResize(event, windowDiv, index));
        resizeHandler.addEventListener('touchstart', (event) => this.startResize(event, windowDiv, index));
      }
    },

    createChromeContainer: function (windowDiv) {
      const chromeContainer = document.createElement('div');
      chromeContainer.classList.add('chrome');
      windowDiv.appendChild(chromeContainer);
      return chromeContainer;
    },

    initializeBrowser: function (windowId, chromeContainer, startUrl, isChromeEnabled) {
      Browser.init(chromeContainer, startUrl, isChromeEnabled);

      chromeContainer.addEventListener('mousedown', this.startDrag.bind(this, windowId));
      chromeContainer.addEventListener('touchstart', this.startDrag.bind(this, windowId));
    },

    // Utility methods for adding an icon image and an animation class
    addIconImage: function (element, icons, iconSize, manifestUrl) {
      const iconImage = document.createElement('img');
      iconImage.crossOrigin = 'anonymous';
      iconImage.onerror = () => {
        iconImage.src = '/style/images/default.png';
      };
      element.appendChild(iconImage);

      const entries = Object.entries(icons);
      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];

        if (entry[0] <= iconSize) {
          continue;
        }
        const url = new URL(manifestUrl);
        iconImage.src = url.origin + '/' + entry[1];
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
     * AppWindow.focus('appframe14');
     * ```
     * @param {String} id
     * @returns null
     */
    focus: function (id) {
      if (this.isDragging) {
        return;
      }

      const windowDiv = document.getElementById(id);
      const manifestUrl = windowDiv.dataset.manifestUrl;
      const dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);
      const focusedWindow = this.focusedWindow;

      windowDiv.style.transform = '';

      if (id !== 'homescreen') {
        this.wallpapers.classList.add('app-open');
        this.bottomPanel.classList.remove('homescreen');
      } else {
        this.wallpapers.classList.remove('app-open');
        this.bottomPanel.classList.add('homescreen');
      }

      if (windowDiv.classList.contains('fullscreen')) {
        this.statusbar.classList.add('hidden');
        this.softwareButtons.classList.add('hidden');
      } else {
        this.statusbar.classList.remove('hidden');
        this.softwareButtons.classList.remove('hidden');
      }

      const appWindows = this.containerElement.querySelectorAll('.appframe');
      for (let index = 0; index < appWindows.length; index++) {
        const element = appWindows[index];
        element.classList.remove('active');
      }

      const dockIcons = this.dock.querySelectorAll('.icon');
      for (let index = 0; index < dockIcons.length; index++) {
        const element = dockIcons[index];
        element.classList.remove('active');
      }

      windowDiv.classList.add('active');
      if (dockIcon) {
        dockIcon.classList.add('active');
      }
      this.focusedWindow = windowDiv;

      this.handleThemeColorFocusUpdated(id);
      Settings.addObserver('video.dark_mode.enabled', () => this.handleThemeColorFocusUpdated(id));

      if (focusedWindow && focusedWindow !== this.homescreenElement && windowDiv !== this.homescreenElement) {
        if (windowDiv === focusedWindow) {
          return;
        }

        focusedWindow.classList.add('to-left');
        focusedWindow.addEventListener('animationend', () => {
          focusedWindow.classList.remove('from-right');
          focusedWindow.classList.remove('to-left');
        });

        windowDiv.classList.add('from-right');
        windowDiv.addEventListener('animationend', () => {
          windowDiv.classList.remove('from-right');
          windowDiv.classList.remove('to-left');
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
     * AppWindow.close('appframe14');
     * ```
     * @param {String} id
     * @returns null
     */
    close: function (id, isFast) {
      if (this.isDragging) {
        return;
      }

      if (id === 'homescreen') {
        return;
      }

      const windowDiv = document.getElementById(id);
      const manifestUrl = windowDiv.dataset.manifestUrl;
      const dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

      if (isFast) {
        windowDiv.remove();
        if (dockIcon) {
          dockIcon.remove();
        }
      } else {
        windowDiv.classList.add(this.CLOSE_ANIMATION);
        if (dockIcon) {
          dockIcon.classList.add(this.CLOSE_ANIMATION);
        }
        windowDiv.addEventListener('animationend', () => {
          windowDiv.style.transform = '';
          windowDiv.classList.remove(this.CLOSE_ANIMATION);
          windowDiv.remove();
          if (dockIcon) {
            dockIcon.classList.remove(this.CLOSE_ANIMATION);
            dockIcon.remove();
          }
          this.focus('homescreen');
        });
      }
    },

    minimize: function (id) {
      if (this.isDragging) {
        return;
      }

      if (id === 'homescreen') {
        return;
      }

      const windowDiv = document.getElementById(id);
      const manifestUrl = windowDiv.dataset.manifestUrl;
      const dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

      this.focus('homescreen');
      windowDiv.classList.add(this.CLOSE_TO_HOMESCREEN_ANIMATION);
      if (dockIcon) {
        dockIcon.classList.add('minimized');
      }
      windowDiv.addEventListener('animationend', () => {
        this.focus('homescreen');
      });
      // Focus plays a 0.5s switch animation which could mess up the close animation timer
      this.timeoutID = setTimeout(() => {
        windowDiv.style.transform = '';
        windowDiv.classList.remove('active');
        windowDiv.classList.remove(this.CLOSE_TO_HOMESCREEN_ANIMATION);
      }, 1000);
    },

    unminimize: function (id) {
      if (this.isDragging) {
        return;
      }

      if (id === 'homescreen') {
        return;
      }

      const windowDiv = document.getElementById(id);
      const manifestUrl = windowDiv.dataset.manifestUrl;
      const dockIcon = this.dock.querySelector(`[data-manifest-url="${manifestUrl}"]`);

      if (windowDiv === this.focusedWindow) {
        return;
      }

      if (dockIcon) {
        dockIcon.classList.remove('minimized');
      }
      this.focus(id);
      windowDiv.classList.add(this.OPEN_ANIMATION);
      windowDiv.addEventListener('animationend', () => {
        windowDiv.classList.remove(this.OPEN_ANIMATION);
        this.focus(id);
      });
    },

    maximize: function (id) {
      if (id === 'homescreen') {
        return;
      }
      const windowDiv = document.getElementById(id);
      windowDiv.classList.add('transitioning');
      windowDiv.classList.toggle('maximized');
      windowDiv.addEventListener('transitionend', () => windowDiv.classList.remove('transitioning'));
    },

    onButtonClick: function (event) {
      switch (event.target) {
        case this.softwareBackButton:
          if (!this.screen.classList.contains('keyboard-visible')) {
            const webview = this.focusedWindow.querySelector('.browser-container .browser.active');
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

    handleThemeColorFocusUpdated: function (id) {
      const windowDiv = document.getElementById(id);
      const webview = windowDiv.querySelector('.browser-container .browser.active');
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
    startDrag: function (windowId, event) {
      if (this.UNDRAGGABLE_ELEMENTS.indexOf(event.target.nodeName) !== -1) {
        return;
      }

      if (platform() !== 'desktop') {
        return;
      }

      event.preventDefault();
      AppWindow.containerElement.classList.add('dragging');
      const windowDiv = document.getElementById(windowId);

      windowDiv.classList.add('transitioning');
      windowDiv.addEventListener('transitionend', () => windowDiv.classList.remove('transitioning'));
      windowDiv.classList.add('dragging');

      // Get initial position
      const initialX = event.pageX || event.touches[0].pageX;
      const initialY = event.pageY || event.touches[0].pageY;

      // Get initial window position
      const initialWindowX = windowDiv.offsetLeft;
      const initialWindowY = windowDiv.offsetTop;

      // Calculate the offset between the initial position and the window position
      const offsetX = initialX - initialWindowX;
      const offsetY = initialY - initialWindowY;

      // windowDiv.style.transformOrigin = `${offsetX}px ${offsetY}px`;

      // Attach event listeners for dragging
      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('touchmove', dragWindow);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);

      // Function to handle dragging
      function dragWindow(event) {
        event.preventDefault();
        const x = event.pageX || event.touches[0].pageX;
        const y = event.pageY || event.touches[0].pageY;

        // Calculate the new position of the window
        const newWindowX = x - offsetX;
        const newWindowY = y - offsetY;

        // Set the new position of the window
        windowDiv.style.left = newWindowX + 'px';
        windowDiv.style.top = newWindowY + 'px';
      }

      // Function to stop dragging
      function stopDrag(event) {
        event.preventDefault();
        AppWindow.containerElement.classList.remove('dragging');

        windowDiv.classList.add('transitioning');
        windowDiv.addEventListener('transitionend', () => windowDiv.classList.remove('transitioning'));
        windowDiv.classList.remove('dragging');

        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('touchmove', dragWindow);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
      }
    },

    startResize: function (event, windowDiv) {
      event.preventDefault();
      this.isResizing = true;
      this.resizingWindow = windowDiv;

      this.startX = event.pageX || event.touches[0].pageX;
      this.startY = event.pageY || event.touches[0].pageY;
      this.startWidth = this.resizingWindow.offsetWidth;
      this.startHeight = this.resizingWindow.offsetHeight;

      document.addEventListener('mousemove', this.resize.bind(this, event.target));
      document.addEventListener('touchmove', this.resize.bind(this, event.target));
      document.addEventListener('mouseup', this.stopResize.bind(this, event.target));
      document.addEventListener('touchend', this.stopResize.bind(this, event.target));
    },

    resize: function (event, gripper) {
      event.preventDefault();
      if (!this.isResizing) return;
      AppWindow.containerElement.classList.add('dragging');

      const currentX = event.pageX || event.touches[0].pageX;
      const currentY = event.pageY || event.touches[0].pageY;

      let width = this.startWidth;
      let height = this.startHeight;
      let left = this.resizingWindow.offsetLeft;
      let top = this.resizingWindow.offsetTop;

      // Calculate the new dimensions based on the resize handler
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
      } else if (gripper.classList.contains('move-center')) {
        // Center (move window)
        left = this.resizingWindow.offsetLeft + (currentX - this.startX);
        top = this.resizingWindow.offsetTop + (currentY - this.startY);
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
      AppWindow.containerElement.classList.remove('dragging');
      document.removeEventListener('mousemove', this.resize.bind(this));
      document.removeEventListener('touchmove', this.resize.bind(this));
      document.removeEventListener('mouseup', this.stopResize.bind(this));
      document.removeEventListener('touchend', this.stopResize.bind(this));
    }
  };

  AppWindow.init();

  exports.AppWindow = AppWindow;
})(window);
