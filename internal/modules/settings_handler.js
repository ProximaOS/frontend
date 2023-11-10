!(function (exports) {
  'use strict';

  const _Settings = require('../../src/settings');

  const SettingsHandler = {
    appElement: document.querySelector('[role="app"]'),

    settings: ['general.lang.code', 'general.software_buttons.enabled', 'homescreen.accent_color.rgb', 'video.wallpaper.url'],
    SETTINGS_LANGUAGE: 0,
    SETTINGS_SOFTWARE_BUTTONS: 1,
    SETTINGS_ACCENT_COLOR: 2,
    SETTINGS_WALLPAPER_IMAGE: 3,

    init: function () {
      _Settings.getValue(this.settings[this.SETTINGS_LANGUAGE]).then(this.handleLanguage.bind(this));
      _Settings.getValue(this.settings[this.SETTINGS_WALLPAPER_IMAGE]).then(this.handleWallpaperAccent.bind(this));
      _Settings.getValue(this.settings[this.SETTINGS_ACCENT_COLOR]).then(this.handleAccentColor.bind(this));
      _Settings.getValue(this.settings[this.SETTINGS_SOFTWARE_BUTTONS]).then(this.handleSoftwareButtons.bind(this));

      _Settings.addObserver(this.settings[this.SETTINGS_LANGUAGE], this.handleLanguage.bind(this));
      _Settings.addObserver(this.settings[this.SETTINGS_WALLPAPER_IMAGE], this.handleWallpaperAccent.bind(this));
      _Settings.addObserver(this.settings[this.SETTINGS_ACCENT_COLOR], this.handleAccentColor.bind(this));
      _Settings.addObserver(this.settings[this.SETTINGS_SOFTWARE_BUTTONS], this.handleSoftwareButtons.bind(this));
    },

    getImageDominantColor: function (url, options = {}) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const colors = [];

        useCanvas(canvas, url)
          .then(() => {
            const downsamplingFactor = options.downsampling || 1;
            const imageData = canvas
              .getContext('2d')
              .getImageData(0, 0, Math.floor(canvas.width / downsamplingFactor), Math.floor(canvas.height / downsamplingFactor)).data;

            for (let i = 0; i < imageData.length; i += 4) {
              const brightness = options.brightness || 1;
              const r = imageData[i] + parseInt((255 - imageData[i]) * (brightness - 1));
              const g = imageData[i + 1] + parseInt((255 - imageData[i + 1]) * (brightness - 1));
              const b = imageData[i + 2] + parseInt((255 - imageData[i + 2]) * (brightness - 1));

              colors.push({ r, g, b });
            }

            if (options.linearGradient !== undefined) {
              resolve('linear-gradient(' + options.linearGradient + ', ' + colors.join(', ') + ')');
            } else {
              resolve(colors);
            }
          })
          .catch(reject);
      });

      function useCanvas(element, imageUrl) {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.src = imageUrl;

          image.onload = () => {
            element.width = options.colors || 1;
            element.height = options.colors || 1;

            element.getContext('2d').drawImage(image, 0, 0, options.colors || 1, options.colors || 1);

            resolve();
          };

          image.onerror = reject;
        });
      }
    },

    handleLanguage: function (value) {
      if ('mozL10n' in navigator) {
        navigator.mozL10n.language.code = value;
      }
    },

    handleWallpaperAccent: async function (value) {
      if (!this.appElement) {
        return;
      }
      if (await _Settings.getValue(this.settings[this.SETTINGS_ACCENT_COLOR])) {
        return;
      }

      this.getImageDominantColor(value, { colors: 3, brightness: 1 }).then((color) => {
        // Convert the color to RGB values
        let r = color[1].r;
        let g = color[1].g;
        let b = color[1].b;

        // Calculate relative luminance
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        // Store original values
        const originalR = r;
        const originalG = g;
        const originalB = b;

        if (luminance < 0.3 && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Brighten the color
          r = r * 2;
          g = g * 2;
          b = b * 2;

          // Ensure color values are within the valid range (0 - 255)
          r = Math.max(0, Math.min(255, r));
          g = Math.max(0, Math.min(255, g));
          b = Math.max(0, Math.min(255, b));
        }

        // Check if the resulting color is too bright, and if so, darken it
        if (luminance > 0.8 && window.matchMedia('(prefers-color-scheme: light)').matches) {
          const maxColorValue = Math.max(r, g, b);
          if (maxColorValue > 200) {
            r = Math.round(originalR * 0.8);
            g = Math.round(originalG * 0.8);
            b = Math.round(originalB * 0.8);
          }
        }

        document.scrollingElement.style.setProperty('--accent-color-r', r);
        document.scrollingElement.style.setProperty('--accent-color-g', g);
        document.scrollingElement.style.setProperty('--accent-color-b', b);

        _Settings.setValue(this.settings[this.SETTINGS_ACCENT_COLOR], { r, g, b });

        // Calculate relative luminance
        const accentLuminance = (0.2126 * originalR + 0.7152 * originalG + 0.0722 * originalB) / 255;

        if (accentLuminance > 0.5) {
          this.appElement.classList.remove('dark');
          this.appElement.classList.add('light');
          document.scrollingElement.style.setProperty('--accent-color-plus', 'rgba(0,0,0,0.75)');
        } else {
          this.appElement.classList.add('dark');
          this.appElement.classList.remove('light');
          document.scrollingElement.style.setProperty('--accent-color-plus', 'rgba(255,255,255,0.75)');
        }
      });
    },

    handleAccentColor: function (value) {
      if (!value || !this.appElement) {
        return;
      }

      document.scrollingElement.style.setProperty('--accent-color-r', value.r);
      document.scrollingElement.style.setProperty('--accent-color-g', value.g);
      document.scrollingElement.style.setProperty('--accent-color-b', value.b);

      // Convert the color to RGB values
      const r = value.r;
      const g = value.g;
      const b = value.b;

      // Calculate relative luminance
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      console.log(r, g, b, luminance);

      if (luminance > 0.5) {
        this.appElement.classList.remove('dark');
        this.appElement.classList.add('light');
        document.scrollingElement.style.setProperty('--accent-color-plus', 'rgba(0,0,0,0.75)');
      } else {
        this.appElement.classList.add('dark');
        this.appElement.classList.remove('light');
        document.scrollingElement.style.setProperty('--accent-color-plus', 'rgba(255,255,255,0.75)');
      }
    },

    handleSoftwareButtons: function (value) {
      if (!this.appElement) {
        return;
      }

      if (navigator.userAgent.includes('Desktop') || value) {
        this.appElement.style.setProperty('--software-buttons-height', '4rem');
      } else {
        if (location.origin.includes(`homescreen.localhost:${location.port}`)) {
          this.appElement.style.setProperty('--software-buttons-height', '1rem');
        } else {
          this.appElement.style.setProperty('--software-buttons-height', '2.5rem');
        }
      }
    }
  };

  SettingsHandler.init();
})(window);
