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

    HIDDEN_ROLES: ['system', 'homescreen'],
    SPLASH_ICON_SIZE: 60,
    DOCK_ICON_SIZE: 40,

    OPEN_ANIMATION: 'expand',
    CLOSE_ANIMATION: 'shrink',

    isDragging: false,
    isResizing: false,
    startX: null,
    startY: null,
    startWidth: null,
    startHeight: null,

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
        if (options.originPos) {
          if (this.homescreenElement) {
            this.homescreenElement.style.transformOrigin = `${options.originPos.x}px ${options.originPos.y}px`;
          }
          existingWindow.style.transformOrigin = `${options.originPos.x}px ${options.originPos.y}px`;
        }
        this.unminimize(existingWindow.id);
        return;
      }

      const windowId = `appframe${AppWindow._id}`;
      console.log(windowId + ': ' + manifestUrl);
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
          windowed: window.matchMedia('(min-width: 768px)').matches,
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
          iconImage.src = entry[1];
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
      if (windowOptions.originPos) {
        if (this.homescreenElement) {
          this.homescreenElement.style.transformOrigin = `${windowOptions.originPos.x}px ${windowOptions.originPos.y}px`;
        }
        windowDiv.style.transformOrigin = `${windowOptions.originPos.x}px ${windowOptions.originPos.y}px`;
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
        splashScreenIcon.src = entry[1];
      });
      splashScreenIcon.onerror = () => {
        splashScreenIcon.src = '/style/images/default.png';
      };

      const grippyBar = document.createElement('div');
      grippyBar.classList.add('grippy-bar');
      grippyBar.addEventListener(
        'touchstart',
        this.handlePointerDown.bind(this)
      );
      grippyBar.addEventListener(
        'pointerdown',
        this.handlePointerDown.bind(this)
      );
      document.addEventListener('touchend', this.handlePointerUp.bind(this));
      document.addEventListener('pointerup', this.handlePointerUp.bind(this));
      document.addEventListener('touchmove', this.handlePointerMove.bind(this));
      document.addEventListener(
        'pointermove',
        this.handlePointerMove.bind(this)
      );
      windowDiv.appendChild(grippyBar);

      if (windowOptions.windowed) {
        if (windowDiv !== this.homescreenElement) {
          windowDiv.classList.add('window');

          windowDiv.style.left = '32px';
          windowDiv.style.top = '32px';
          windowDiv.style.width = '1024px';
          windowDiv.style.height = '640px';

          const titlebar = document.createElement('div');
          titlebar.classList.add('titlebar');
          titlebar.addEventListener(
            'mousedown',
            this.startDrag.bind(this, windowDiv.id)
          );
          titlebar.addEventListener(
            'touchstart',
            this.startDrag.bind(this, windowDiv.id)
          );
          windowDiv.appendChild(titlebar);

          const closeButton = document.createElement('button');
          closeButton.classList.add('close-button');
          closeButton.addEventListener('click', (event) =>
            this.close(windowId)
          );
          titlebar.appendChild(closeButton);

          const resizeButton = document.createElement('button');
          resizeButton.classList.add('resize-button');
          resizeButton.addEventListener('click', (event) =>
            this.maximize(windowId)
          );
          titlebar.appendChild(resizeButton);

          const minimizeButton = document.createElement('button');
          minimizeButton.classList.add('minimize-button');
          minimizeButton.addEventListener('click', (event) =>
            this.minimize(windowId)
          );
          titlebar.appendChild(minimizeButton);
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
          resizeHandler.addEventListener(
            'mousedown',
            this.startResize.bind(this)
          );
          resizeHandler.addEventListener(
            'touchstart',
            this.startResize.bind(this)
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
      }

      this.handleThemeColorFocusUpdated(id);
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
    close: function (id) {
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

      windowDiv.classList.add(this.CLOSE_ANIMATION);
      if (dockIcon) {
        dockIcon.classList.add('minimized');
      }
      windowDiv.addEventListener('animationend', () => {
        windowDiv.style.transform = '';
        windowDiv.classList.remove('active');
        windowDiv.classList.remove(this.CLOSE_ANIMATION);
        this.focus('homescreen');
      });
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
      windowDiv.addEventListener('animationend', () => {
        windowDiv.style.transform = '';
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
            const webview = this.focusedWindow.querySelector('.browser.active');
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
        color = webview.dataset.themeColor;
        if (!color) {
          return;
        }
      } else {
        return;
      }

      if (color) {
        // Calculate the luminance of the color
        const luminance = this.calculateLuminance(color);

        // If the color is light (luminance > 0.5), add 'light' class to the status bar
        if (luminance > 0.5) {
          this.statusbar.classList.add('light');
          this.softwareButtons.classList.add('light');
          this.statusbar.classList.remove('dark');
          this.softwareButtons.classList.remove('dark');
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

    // Add the following event handler for touchstart and pointerdown events on the grippy bar
    handlePointerDown: function (event) {
      event.preventDefault();
      this.startY = event.clientY;
      this.isDragging = true;
      this.containerElement.classList.add('dragging');
    },

    // Add the following event handler for touchmove and pointermove events on the grippy bar
    handlePointerMove: function (event) {
      event.preventDefault();
      if (this.isDragging) {
        const currentYPosition = event.clientY;
        const distanceY = currentYPosition - this.this.startY;

        // Move the window along the Y-axis based on the dragging distance
        if (!this.focusedWindow.dataset.oldTransformOrigin) {
          this.focusedWindow.dataset.oldTransformOrigin =
            this.focusedWindow.style.transformOrigin;
        }
        this.focusedWindow.style.transformOrigin = 'center bottom';
        this.focusedWindow.style.transform = `translateY(${
          distanceY / 2
        }px) scale(${window.innerHeight / (window.innerHeight - distanceY)})`;
      }
    },

    handlePointerUp: function (event) {
      event.preventDefault();
      if (this.isDragging) {
        const currentYPosition = event.clientY;
        const distanceY = currentYPosition - this.this.startY;

        // Reset the window transform
        this.focusedWindow.style.transformOrigin =
          this.focusedWindow.dataset.oldTransformOrigin;

        this.startY = null;
        this.isDragging = false;

        this.containerElement.classList.remove('dragging');
        console.log(distanceY);
        if (distanceY <= -300) {
          CardsView.show();
          this.focusedWindow.style.transform = '';
        } else if (distanceY <= -100) {
          AppWindow.minimize(AppWindow.focusedWindow.id);
        } else {
          this.focusedWindow.classList.add('transitioning');
          this.focusedWindow.addEventListener('transitionend', () => {
            this.focusedWindow.classList.remove('transitioning');
            this.focusedWindow.style.transform = '';
          });
        }
      }
    },

    startResize: function (event) {
      event.preventDefault();
      isResizing = true;

      startX = event.pageX || event.touches[0].pageX;
      startY = event.pageY || event.touches[0].pageY;
      startWidth = windowDiv.offsetWidth;
      startHeight = windowDiv.offsetHeight;

      document.addEventListener('mousemove', resize);
      document.addEventListener('touchmove', resize);
      document.addEventListener('mouseup', stopResize);
      document.addEventListener('touchend', stopResize);
    },

    resize: function (event) {
      event.preventDefault();
      if (!isResizing) return;
      AppWindow.containerElement.classList.add('dragging');

      const currentX = event.pageX || event.touches[0].pageX;
      const currentY = event.pageY || event.touches[0].pageY;

      let width = startWidth;
      let height = startHeight;
      let left = windowDiv.offsetLeft;
      let top = windowDiv.offsetTop;

      // Calculate the new dimensions based on the resize handler's index
      switch (index) {
        case 0: // Top Left
          width = startWidth + (startX - currentX);
          height = startHeight + (startY - currentY);
          left = windowDiv.offsetLeft - (startX - currentX);
          top = windowDiv.offsetTop - (startY - currentY);
          break;
        case 1: // Top
          height = startHeight + (startY - currentY);
          top = windowDiv.offsetTop - (startY - currentY);
          break;
        case 2: // Top Right
          width = startWidth + (currentX - startX);
          height = startHeight + (startY - currentY);
          top = windowDiv.offsetTop - (startY - currentY);
          break;
        case 3: // Left
          width = startWidth + (startX - currentX);
          left = windowDiv.offsetLeft - (startX - currentX);
          break;
        case 4: // Right
          width = startWidth + (currentX - startX);
          break;
        case 5: // Bottom Left
          width = startWidth + (startX - currentX);
          height = startHeight + (currentY - startY);
          left = windowDiv.offsetLeft - (startX - currentX);
          break;
        case 6: // Bottom
          height = startHeight + (currentY - startY);
          break;
        case 7: // Bottom Right
          width = startWidth + (currentX - startX);
          height = startHeight + (currentY - startY);
          break;
        case 8: // Center (move window)
          left = windowDiv.offsetLeft + (currentX - startX);
          top = windowDiv.offsetTop + (currentY - startY);
          break;
        default:
          break;
      }

      // Update the position and dimensions of the window
      windowDiv.style.width = `${width}px`;
      windowDiv.style.height = `${height}px`;
      windowDiv.style.left = `${left}px`;
      windowDiv.style.top = `${top}px`;
    },

    stopResize: function (event) {
      event.preventDefault();
      isResizing = false;
      AppWindow.containerElement.classList.remove('dragging');
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('touchmove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('touchend', stopResize);
    }
  };

  AppWindow.init();

  exports.AppWindow = AppWindow;
})(window);
