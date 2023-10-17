!(function (exports) {
  'use strict';

  const Homescreen = {
    app: document.getElementById('app'),

    init: function () {
      Settings.getValue('video.wallpaper.url').then(
        this.handleWallpaperSetting.bind(this)
      );
      Settings.addObserver(
        'video.wallpaper.url',
        this.handleWallpaperSetting.bind(this)
      );
    },

    handleWallpaperSetting: function (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
      console.log(imageUrl);

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightness = 0;

        for (let i = 0; i < data.length; i += 4) {
          brightness += 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        }

        brightness = Math.floor(brightness / (canvas.width * canvas.height));

        this.handleLuminance(brightness);
      };
    },

    handleLuminance: function (luminance) {
      if (luminance >= 0.75) {
        this.app.classList.add('light');
        this.app.classList.remove('dark');
        this.isLight = true;
      } else {
        this.app.classList.remove('light');
        this.app.classList.add('dark');
        this.isLight = false;
      }
    }
  };

  Homescreen.init();

  exports.Homescreen = Homescreen;
})(window);
