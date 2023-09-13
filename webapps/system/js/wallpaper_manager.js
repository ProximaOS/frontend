!(function (exports) {
  'use strict';

  const WallpaperManager = {
    screen: document.getElementById('screen'),

    init: function () {
      Settings.getValue('video.wallpaper.url').then((value) => {
        this.screen.style.backgroundImage = `url(${value})`;
      });
      Settings.addObserver('video.wallpaper.url', (value) => {
        this.screen.style.backgroundImage = `url(${value})`;
      });
    }
  };

  WallpaperManager.init();
})(window);
