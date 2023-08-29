!(function (exports) {
  'use strict';

  const WallpaperManager = {
    screen: document.getElementById('screen'),

    init: function () {
      _session.settings.getValue('video.wallpaper.url').then((value) => {
        this.screen.style.backgroundImage = `url(${value})`;
      });
      _session.settings.addObserver('video.wallpaper.url', (value) => {
        this.screen.style.backgroundImage = `url(${value})`;
      });
    }
  };

  WallpaperManager.init();
})(window);
