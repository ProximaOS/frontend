!(function (exports) {
  'use strict';

  const WallpaperManager = {
    screen: document.getElementById('screen'),

    init: function () {
      window.Settings.getValue('video.wallpaper.url').then((value) => {
        this.screen.style.backgroundImage = `url(${value})`;
      });
      window.Settings.addObserver('video.wallpaper.url', (value) => {
        this.screen.style.backgroundImage = `url(${value})`;
      });
    }
  };

  WallpaperManager.init();
})(window);
