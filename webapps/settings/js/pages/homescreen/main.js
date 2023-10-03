!(function (exports) {
  'use strict';

  const Homescreen = {
    wallpaper: document.getElementById('wallpaper'),
    wallpaperImage: document.getElementById('wallpaper-image'),

    init: function () {
      window.Settings.getValue('video.wallpaper.url').then((data) => {
        this.wallpaperImage.src = data;
      });
    }
  };

  Homescreen.init();
})(window);
