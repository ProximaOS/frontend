!(function (exports) {
  'use strict';

  const AppWindow = {
    _id: 0,

    screen: document.getElementById('screen'),
    containerElement: document.getElementById('windows'),
    statusbar: document.getElementById('statusbar'),
    softwareButtons: document.getElementById('software-buttons'),
    keyboard: document.getElementById('keyboard'),
    dock: document.getElementById('dock'),

    HIDDEN_ROLES: ['system', 'homescreen'],
    SPLASH_ICON_SIZE: 60,
    DOCK_ICON_SIZE: 40,

    OPEN_ANIMATION: 'expand',
    CLOSE_ANIMATION: 'shrink',

    init: function () {
      // Nothing here...
    },

    create: async function (manifestUrl, options) {
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
          transparent: manifest.transparent,
          cli_args: ''
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
      if (windowOptions.transparent) {
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

      // Attach event listeners for resizing
      let isResizing = false;
      let startX, startY, startWidth, startHeight;
      const resizeHandlers = [];

      // Create and append the resize handlers in all directions
      for (let i = 0; i < 9; i++) {
        const resizeHandler = document.createElement('div');
        resizeHandler.classList.add('resize-handler');
        windowDiv.appendChild(resizeHandler);
        resizeHandlers.push(resizeHandler);
      }

      // Set the cursor style for each resize handler
      resizeHandlers[0].style.cursor = 'nw-resize';
      resizeHandlers[1].style.cursor = 'n-resize';
      resizeHandlers[2].style.cursor = 'ne-resize';
      resizeHandlers[3].style.cursor = 'w-resize';
      resizeHandlers[4].style.cursor = 'e-resize';
      resizeHandlers[5].style.cursor = 'sw-resize';
      resizeHandlers[6].style.cursor = 's-resize';
      resizeHandlers[7].style.cursor = 'se-resize';

      // Attach event listeners to each resize handler
      resizeHandlers.forEach((resizeHandler, index) => {
        resizeHandler.addEventListener('mousedown', startResize);
        resizeHandler.addEventListener('touchstart', startResize);

        function startResize (event) {
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
        }

        function resize (event) {
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
        }
      });

      function stopResize (event) {
        event.preventDefault();
        isResizing = false;
        AppWindow.containerElement.classList.remove('dragging');
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('touchmove', resize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchend', stopResize);
      }

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
        iconImage.src = entry[1];
      });
      splashScreenIcon.onerror = () => {
        splashScreenIcon.src = '/style/images/default.png';
      };

      if (windowDiv.id !== 'homescreen') {
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
        closeButton.addEventListener('click', this.close.bind(this, windowId));
        titlebar.appendChild(closeButton);

        const resizeButton = document.createElement('button');
        resizeButton.classList.add('resize-button');
        resizeButton.addEventListener(
          'click',
          this.maximize.bind(this, windowId)
        );
        titlebar.appendChild(resizeButton);

        const minimizeButton = document.createElement('button');
        minimizeButton.classList.add('minimize-button');
        minimizeButton.addEventListener(
          'click',
          this.minimize.bind(this, windowId)
        );
        titlebar.appendChild(minimizeButton);
      }

      // Create chrome
      const chromeContainer = document.createElement('div');
      chromeContainer.classList.add('chrome');
      chromeContainer.addEventListener(
        'mousedown',
        this.startDrag.bind(this, windowDiv.id)
      );
      chromeContainer.addEventListener(
        'touchstart',
        this.startDrag.bind(this, windowDiv.id)
      );
      windowDiv.appendChild(chromeContainer);

      let isChromeEnabled = false;
      if (manifest.chrome && manifest.chrome.navigation) {
        isChromeEnabled = true;
        windowDiv.classList.add('chrome-visible');
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

    focus: function (id) {
      const windowDiv = document.getElementById(id);
      const manifestUrl = windowDiv.dataset.manifestUrl;
      const dockIcon = this.dock.querySelector(
        `[data-manifest-url="${manifestUrl}"]`
      );

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

      this.handleThemeColorFocusUpdated(id);
    },

    close: function (id) {
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
        windowDiv.classList.remove('active');
        windowDiv.classList.remove(this.CLOSE_ANIMATION);
        this.focus('homescreen');
      });
    },

    unminimize: function (id) {
      if (id === 'homescreen') {
        return;
      }
      const windowDiv = document.getElementById(id);
      const manifestUrl = windowDiv.dataset.manifestUrl;
      const dockIcon = this.dock.querySelector(
        `[data-manifest-url="${manifestUrl}"]`
      );

      windowDiv.classList.add('active');
      windowDiv.classList.add(this.OPEN_ANIMATION);
      if (dockIcon) {
        dockIcon.classList.remove('minimized');
      }
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

      // Get initial position
      const initialX = event.pageX || event.touches[0].pageX;
      const initialY = event.pageY || event.touches[0].pageY;

      // Get initial window position
      const initialWindowX = windowDiv.offsetLeft;
      const initialWindowY = windowDiv.offsetTop;

      // Calculate the offset between the initial position and the window position
      const offsetX = initialX - initialWindowX;
      const offsetY = initialY - initialWindowY;

      // Attach event listeners for dragging
      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('touchmove', dragWindow);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);

      // Function to handle dragging
      function dragWindow (event) {
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
      function stopDrag (event) {
        event.preventDefault();
        AppWindow.containerElement.classList.remove('dragging');
        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('touchmove', dragWindow);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
      }
    }
  };

  AppWindow.init();

  exports.AppWindow = AppWindow;
})(window);
