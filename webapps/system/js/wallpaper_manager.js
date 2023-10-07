!(function (exports) {
  'use strict';

  const WallpaperManager = {
    wallpaperImage: document.getElementById('wallpaper-image'),
    wallpaperVideo: document.getElementById('wallpaper-video'),

    init: function () {
      Settings.getValue('video.wallpaper.url').then((value) => {
        this.wallpaperImage.src = value;
        this.wallpaperVideo.src = '';
      });
      Settings.addObserver('video.wallpaper.url', (value) => {
        this.wallpaperImage.src = value;
        this.wallpaperVideo.src = '';
      });
    },

    playVideoInStyle: function () {
      if (!this.wallpaperVideo.duration) {
        return;
      }

      const duration = 2000; // 2 seconds in milliseconds
      const initialSpeed = 2; // Initial playback speed
      const targetSpeed = 0;

      this.wallpaperVideo.currentTime = 0;
      this.wallpaperVideo.playbackRate = initialSpeed;

      this.wallpaperVideo.play();

      const startTime = performance.now();
      function animate () {
        const currentTime = performance.now();
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        const newSpeed = initialSpeed + (targetSpeed - initialSpeed) * easedProgress;
        this.wallpaperVideo.playbackRate = newSpeed;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      animate();
    }
  };

  WallpaperManager.init();

  exports.WallpaperManager = WallpaperManager;
})(window);
