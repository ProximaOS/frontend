!(function (exports) {
  'use strict';

  const AppWindow = {
    _id: 0,

    screen: document.getElementById('screen'),
    containerElement: document.getElementById('windows'),
    statusbar: document.getElementById('statusbar'),
    softwareButtons: document.getElementById('software-buttons'),
    keyboard: document.getElementById('keyboard'),
    softwareBackButton: document.getElementById('software-back-button'),
    softwareHomeButton: document.getElementById('software-home-button'),
    dock: document.getElementById('dock'),

    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme'],
    SPLASH_ICON_SIZE: 60,
    DOCK_ICON_SIZE: 40,

    OPEN_ANIMATION: 'expand',
    CLOSE_ANIMATION: 'shrink',
    CLOSE_TO_HOMESCREEN_ANIMATION: 'shrink-to-homescreen',

    timer: null,
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
      this.softwareBackButton.addEventListener(
        'click',
        this.onButtonClick.bind(this)
      );
      this.softwareHomeButton.addEventListener(
        'click',
        this.onButtonClick.bind(this)
      );
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
      const existingWindow = this.containerElement.querySelector(
        `[data-manifest-url="${manifestUrl}"]`
      );
      if (existingWindow) {
        if (options.animVariables) {
          if (this.homescreenElement) {
            this.homescreenElement.style.transformOrigin = `${options.animVariables.xPos}px ${options.animVariables.yPos}px`;
          }
          existingWindow.style.transformOrigin = `${options.animVariables.xPos}px ${options.animVariables.yPos}px`;
          existingWindow.style.setProperty('--icon-pos-x', options.animVariables.iconXPos + 'px');
          existingWindow.style.setProperty('--icon-pos-y', options.animVariables.iconYPos + 'px');
          existingWindow.style.setProperty('--icon-scale-x', options.animVariables.iconXScale);
          existingWindow.style.setProperty('--icon-scale-y', options.animVariables.iconYScale);
        }
        this.unminimize(existingWindow.id);
        return;
      }

      const windowId = `appframe${AppWindow._id}`;
      AppWindow._id++;

      let manifest;
      await fetch(manifestUrl)
        .then((response) => response.json())
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
          windowed: window.platform() === 'desktop',
          cli_args: []
        },
        options
      );

      // Create dock icon
      if (this.HIDDEN_ROLES.indexOf(manifest.role) === -1) {
        const icon = document.createElement('div');
        icon.classList.add('icon');
        icon.dataset.manifestUrl = manifestUrl;
        icon.onclick = () => {
          this.focus(windowId);
        };
        this.dock.appendChild(icon);

        icon.classList.add(this.OPEN_ANIMATION);
        icon.addEventListener('animationend', () => {
          icon.classList.remove(this.OPEN_ANIMATION);
        });

        const iconImage = document.createElement('img');
        iconImage.crossOrigin = 'anonymous';
        Object.entries(manifest.icons).forEach((entry) => {
          if (entry[0] <= this.DOCK_ICON_SIZE) {
            return;
          }
          const url = new URL(manifestUrl);
          iconImage.src = url.origin + '/' + entry[1];
        });
        iconImage.onerror = () => {
          iconImage.src = '/style/images/default.png';
        };
        icon.appendChild(iconImage);
      }

      // Create window container
      const windowDiv = document.createElement('div');
      windowDiv.dataset.manifestUrl = manifestUrl;
      if (manifest.role === 'homescreen') {
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
      if (manifest.transparent) {
        windowDiv.classList.add('transparent');
      }
      if (windowOptions.animVariables) {
        if (this.homescreenElement) {
          this.homescreenElement.style.transformOrigin = `${windowOptions.animVariables.xPos}px ${windowOptions.animVariables.yPos}px`;
        }
        windowDiv.style.transformOrigin = `${windowOptions.animVariables.xPos}px ${windowOptions.animVariables.yPos}px`;
        windowDiv.style.setProperty('--icon-pos-x', options.animVariables.iconXPos + 'px');
        windowDiv.style.setProperty('--icon-pos-y', options.animVariables.iconYPos + 'px');
        windowDiv.style.setProperty('--icon-scale-x', options.animVariables.iconXScale);
        windowDiv.style.setProperty('--icon-scale-y', options.animVariables.iconYScale);
      }
      this.containerElement.appendChild(windowDiv);

      // Focus the app window
      this.focus(windowDiv.id);

      windowDiv.classList.add(this.OPEN_ANIMATION);
      windowDiv.addEventListener('animationend', () => {
        windowDiv.classList.remove(this.OPEN_ANIMATION);
      });

      const splashScreen = document.createElement('div');
      splashScreen.classList.add('splashscreen');
      windowDiv.appendChild(splashScreen);

      const splashScreenIcon = document.createElement('img');
      splashScreenIcon.classList.add('icon');
      splashScreen.appendChild(splashScreenIcon);
      Object.entries(manifest.icons).forEach((entry) => {
        if (entry[0] <= this.SPLASH_ICON_SIZE) {
          return;
        }
        const url = new URL(manifestUrl);
        splashScreenIcon.src = url.origin + '/' + entry[1];
      });
      splashScreenIcon.onerror = () => {
        splashScreenIcon.src = '/style/images/default.png';
      };

      if (windowOptions.windowed) {
        if (windowDiv !== this.homescreenElement) {
          windowDiv.classList.add('window');

          windowDiv.style.left = '32px';
          windowDiv.style.top = '32px';
          windowDiv.style.width = '1024px';
          windowDiv.style.height = '640px';

          const titlebar = document.createElement('div');
          titlebar.classList.add('titlebar');
          windowDiv.appendChild(titlebar);

          const titlebarGrippy = document.createElement('div');
          titlebarGrippy.classList.add('titlebar-grippy');
          titlebarGrippy.addEventListener(
            'mousedown',
            this.startDrag.bind(this, windowDiv.id)
          );
          titlebarGrippy.addEventListener(
            'touchstart',
            this.startDrag.bind(this, windowDiv.id)
          );
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
        }

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
        resizeHandlers.forEach((resizeHandler, index) => {
          resizeHandler.addEventListener('mousedown', (event) =>
            this.startResize(event, windowDiv)
          );
          resizeHandler.addEventListener('touchstart', (event) =>
            this.startResize(event, windowDiv)
          );
        });
      }

      // Create chrome
      const chromeContainer = document.createElement('div');
      chromeContainer.classList.add('chrome');
      windowDiv.appendChild(chromeContainer);

      let isChromeEnabled = false;
      if (manifest.chrome && manifest.chrome.navigation) {
        isChromeEnabled = true;
      }

      if (manifest.start_url) {
        Browser.init(chromeContainer, manifest.start_url, isChromeEnabled);
      } else {
        if (manifest.launch_path) {
          const url = new URL(manifestUrl);
          Browser.init(
            chromeContainer,
            url.origin + manifest.launch_path,
            isChromeEnabled
          );
        }
      }
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
      const dockIcon = this.dock.querySelector(
        `[data-manifest-url="${manifestUrl}"]`
      );
      const focusedWindow = this.focusedWindow;

      windowDiv.style.transform = '';

      if (windowDiv.classList.contains('fullscreen')) {
        this.statusbar.classList.add('hidden');
        this.softwareButtons.classList.add('hidden');
      } else {
        this.statusbar.classList.remove('hidden');
        this.softwareButtons.classList.remove('hidden');
      }

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

      Settings.addObserver('video.dark_mode.enabled', () =>
        this.handleThemeColorFocusUpdated(id)
      );

      if (
        focusedWindow &&
        focusedWindow !== this.homescreenElement &&
        windowDiv !== this.homescreenElement
      ) {
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
        this.homescreenElement.classList.add('transitioning');
        this.homescreenElement.addEventListener('animationend', () => {
          this.homescreenElement.classList.remove('transitioning');
        });
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
      const dockIcon = this.dock.querySelector(
        `[data-manifest-url="${manifestUrl}"]`
      );

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
      const dockIcon = this.dock.querySelector(
        `[data-manifest-url="${manifestUrl}"]`
      );

      this.focus('homescreen');
      windowDiv.classList.add(this.CLOSE_TO_HOMESCREEN_ANIMATION);
      if (dockIcon) {
        dockIcon.classList.add('minimized');
      }
      windowDiv.addEventListener('animationend', () => {
        this.focus('homescreen');
      });
      // Focus plays a 0.5s switch animation which could mess up the close animation timer
      this.timer = setTimeout(() => {
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
      const dockIcon = this.dock.querySelector(
        `[data-manifest-url="${manifestUrl}"]`
      );

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
      windowDiv.addEventListener('animationend', () => {
        windowDiv.classList.remove('transitioning');
      });
    },

    onButtonClick: function (event) {
      switch (event.target) {
        case this.softwareBackButton:
          if (!this.screen.classList.contains('keyboard-visible')) {
            const webview = this.focusedWindow.querySelector(
              '.browser-container .browser.active'
            );
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
      const webview = windowDiv.querySelector(
        '.browser-container .browser.active'
      );
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
      event.preventDefault();
      AppWindow.containerElement.classList.add('dragging');
      const windowDiv = document.getElementById(windowId);

      windowDiv.classList.add('transitioning-bouncy');
      windowDiv.addEventListener('transitionend', () =>
        windowDiv.classList.remove('transitioning-bouncy')
      );
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

      windowDiv.style.transformOrigin = `${offsetX}px ${offsetY}px`;

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

        windowDiv.classList.add('transitioning-bouncy');
        windowDiv.addEventListener('transitionend', () =>
          windowDiv.classList.remove('transitioning-bouncy')
        );
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

      document.addEventListener('mousemove', (event1) =>
        this.resize(event1, event.target)
      );
      document.addEventListener('touchmove', (event1) =>
        this.resize(event1, event.target)
      );
      document.addEventListener('mouseup', (event1) =>
        this.stopResize(event1, event.target)
      );
      document.addEventListener('touchend', (event1) =>
        this.stopResize(event1, event.target)
      );
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
      if (gripper.classList.contains('resize-nw')) {
        // Top Left
        width = this.startWidth + (this.startX - currentX);
        height = this.startHeight + (this.startY - currentY);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (gripper.classList.contains('resize-n')) {
        // Top
        height = this.startHeight + (this.startY - currentY);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (gripper.classList.contains('resize-ne')) {
        // Top Right
        width = this.startWidth + (currentX - this.startX);
        height = this.startHeight + (this.startY - currentY);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (gripper.classList.contains('resize-w')) {
        // Left
        width = this.startWidth + (this.startX - currentX);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
      } else if (gripper.classList.contains('resize-e')) {
        // Right
        width = this.startWidth + (currentX - this.startX);
      } else if (gripper.classList.contains('resize-sw')) {
        // Bottom Left
        width = this.startWidth + (this.startX - currentX);
        height = this.startHeight + (currentY - this.startY);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
      } else if (gripper.classList.contains('resize-s')) {
        // Bottom
        height = this.startHeight + (currentY - this.startY);
      } else if (gripper.classList.contains('resize-se')) {
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
