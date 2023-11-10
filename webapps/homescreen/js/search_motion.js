!(function (exports) {
  'use strict';

  const SearchMotion = {
    app: document.getElementById('app'),
    gridElement: document.getElementById('grid'),
    motionElement: document.getElementById('search'),
    themeColorMeta: document.querySelector('meta[name=theme-color]'),

    startY: 0,
    currentY: 0,
    isDragging: false,
    threshold: 0.5, // Adjust the threshold as desired (0.0 to 1.0)
    yPosThreshold: window.innerHeight / 2,
    lastProgress: 0,
    currentProgress: 0,

    init: function () {
      this.gridElement.addEventListener(
        'mousedown',
        this.onPointerDown.bind(this)
      );
      this.gridElement.addEventListener(
        'touchstart',
        this.onPointerDown.bind(this)
      );
      this.motionElement.addEventListener(
        'mousedown',
        this.onPointerDown.bind(this)
      );
      this.motionElement.addEventListener(
        'touchstart',
        this.onPointerDown.bind(this)
      );
      document.addEventListener('mousemove', this.onPointerMove.bind(this));
      document.addEventListener('touchmove', this.onPointerMove.bind(this));
      document.addEventListener('mouseup', this.onPointerUp.bind(this));
      document.addEventListener('touchend', this.onPointerUp.bind(this));
      document.addEventListener('mouseleave', this.onPointerCancel.bind(this));
      document.addEventListener('touchcancel', this.onPointerCancel.bind(this));
    },

    onPointerDown: function (event) {
      this.startY = event.clientY || event.touches[0].clientY;
      this.currentY = this.startY;
      this.isDragging = true;
      this.app.classList.add('search-visible');
    },

    onPointerMove: function (event) {
      if (
        event.target.nodeName === 'A' ||
        event.target.nodeName === 'BUTTON' ||
        event.target.nodeName === 'INPUT'
      ) {
        return;
      }

      if (this.isDragging) {
        this.currentY = event.clientY || event.touches[0].clientY;
        const offsetY = this.startY - this.currentY;
        const maxHeight = this.yPosThreshold;
        const progress = (offsetY / maxHeight) * -1;

        this.updateMotionProgress(progress); // Update motion element opacity
      }
    },

    onPointerUp: function () {
      this.currentY = event.clientY || event.touches[0].clientY;
      const offsetY = this.startY - this.currentY;
      const maxHeight = this.yPosThreshold;
      let progress = ((offsetY / maxHeight) * -1) / 2;
      progress = this.lastProgress + progress;
      console.log(progress);

      progress = Math.min(1, progress); // Limit progress between 0 and 1

      this.app.classList.remove('search-visible');
      if (progress >= this.threshold) {
        this.currentProgress = 1;
        if (document.body.classList.contains('light')) {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.themeColorMeta.setAttribute(
              'content',
              `rgb(${255 - this.currentProgress * 255}, ${
                255 - this.currentProgress * 255
              }, ${255 - this.currentProgress * 255})`
            );
          } else {
            this.themeColorMeta.setAttribute('content', 'rgb(255, 255, 255)');
          }
        } else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.themeColorMeta.setAttribute('content', 'rgb(0, 0, 0)');
          } else {
            this.themeColorMeta.setAttribute(
              'content',
              `rgb(${this.currentProgress * 255}, ${
                this.currentProgress * 255
              }, ${this.currentProgress * 255})`
            );
          }
        }
        this.lastProgress = this.currentProgress;
        this.app.style.setProperty('--motion-progress', 1);
        this.app.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.app.classList.remove('transitioning');
        }, 500);
      } else {
        this.currentProgress = 0;
        if (document.body.classList.contains('light')) {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.themeColorMeta.setAttribute(
              'content',
              `rgb(${255 - this.currentProgress * 255}, ${
                255 - this.currentProgress * 255
              }, ${255 - this.currentProgress * 255})`
            );
          } else {
            this.themeColorMeta.setAttribute('content', 'rgb(255, 255, 255)');
          }
        } else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.themeColorMeta.setAttribute('content', 'rgb(0, 0, 0)');
          } else {
            this.themeColorMeta.setAttribute(
              'content',
              `rgb(${this.currentProgress * 255}, ${
                this.currentProgress * 255
              }, ${this.currentProgress * 255})`
            );
          }
        }
        this.lastProgress = this.currentProgress;
        this.app.style.setProperty('--motion-progress', 0);
        this.app.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.app.classList.remove('transitioning');
        }, 500);
        this.hideMotionElement();
      }

      this.isDragging = false;
    },

    onPointerCancel: function () {
      this.resetMotionElement();
      this.isDragging = false;
    },

    updateMotionProgress: function (progress) {
      progress = this.lastProgress + progress;
      const motionProgress = Math.max(0, Math.min(1, progress)); // Limit progress between 0 and 1;
      this.currentProgress = motionProgress;
      if (document.body.classList.contains('light')) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.themeColorMeta.setAttribute(
            'content',
            `rgb(${255 - this.currentProgress * 255}, ${
              255 - this.currentProgress * 255
            }, ${255 - this.currentProgress * 255})`
          );
        } else {
          this.themeColorMeta.setAttribute('content', 'rgb(255, 255, 255)');
        }
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.themeColorMeta.setAttribute('content', 'rgb(0, 0, 0)');
        } else {
          this.themeColorMeta.setAttribute(
            'content',
            `rgb(${this.currentProgress * 255}, ${
              this.currentProgress * 255
            }, ${this.currentProgress * 255})`
          );
        }
      }
      this.app.style.setProperty('--motion-progress', motionProgress);

      if (motionProgress <= this.threshold) {
        this.motionElement.classList.add('fade-out');
        this.motionElement.classList.remove('fade-in');
      } else {
        this.showMotionElement();
        this.motionElement.classList.add('fade-in');
        this.motionElement.classList.remove('fade-out');
      }
    },

    hideMotionElement: function () {
      this.lastProgress = 0;
      this.app.classList.remove('search-visible');
      this.motionElement.classList.remove('visible');
      this.app.style.setProperty('--motion-progress', 0);
    },

    showMotionElement: function () {
      this.app.classList.add('search-visible');
      this.motionElement.classList.add('visible');
    },

    resetMotionElement: function () {
      const offsetY = this.startY - this.currentY;
      const maxHeight = this.yPosThreshold;
      const progress = 1 - offsetY / maxHeight;

      if (progress >= this.threshold) {
        this.currentProgress = 0;
        if (document.body.classList.contains('light')) {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.themeColorMeta.setAttribute(
              'content',
              `rgb(${255 - this.currentProgress * 255}, ${
                255 - this.currentProgress * 255
              }, ${255 - this.currentProgress * 255})`
            );
          } else {
            this.themeColorMeta.setAttribute('content', 'rgb(255, 255, 255)');
          }
        } else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.themeColorMeta.setAttribute('content', 'rgb(0, 0, 0)');
          } else {
            this.themeColorMeta.setAttribute(
              'content',
              `rgb(${this.currentProgress * 255}, ${
                this.currentProgress * 255
              }, ${this.currentProgress * 255})`
            );
          }
        }
        this.app.style.setProperty('--motion-progress', 0);
        this.app.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.app.classList.remove('transitioning');
        }, 500);
      }
    }
  };

  SearchMotion.init();
})(window);
