!(function (exports) {
  'use strict';

  const UtilityTrayMotion = {
    titlebar: document.querySelector('#utility-tray .titlebar'),

    screen: document.getElementById('screen'),
    topPanel: document.getElementById('top-panel'),
    statusbar: document.getElementById('statusbar'),
    motionElement: document.getElementById('utility-tray-motion'),
    controlCenter: document.getElementById('control-center'),
    notifications: document.getElementById('notifications'),

    startY: 0,
    currentY: 0,
    isDragging: false,
    threshold: 0.25, // Adjust the threshold as desired (0.0 to 1.0)

    init: function () {
      this.topPanel.addEventListener(
        'mousedown',
        this.onPointerDown.bind(this)
      );
      this.topPanel.addEventListener(
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
      document.addEventListener('mouseleave', this.onPointerUp.bind(this));
      document.addEventListener('touchcancel', this.onPointerUp.bind(this));
    },

    onPointerDown: function (event) {
      this.startY = event.clientY || event.touches[0].clientY;
      this.currentY = this.startY;
      this.isDragging = true;
      this.screen.classList.add('utility-tray-visible');
      this.statusbar.classList.add('tray-open');
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
        if (
          event.target === this.topPanel &&
          this.motionElement.classList.contains('visible')
        ) {
          if (
            (event.clientX || event.touches[0].clientX) >=
            window.innerWidth / 2
          ) {
            this.controlCenter.classList.add('hidden');
            this.notifications.classList.remove('hidden');
          } else {
            this.controlCenter.classList.remove('hidden');
            this.notifications.classList.add('hidden');
          }
        }

        this.currentY = event.clientY || event.touches[0].clientY;
        const offsetY = this.startY - this.currentY;
        const maxHeight = this.motionElement.offsetHeight;
        const progress = (offsetY / maxHeight) * -1;

        this.updateMotionProgress(progress); // Update motion element opacity
      }
    },

    onPointerUp: function () {
      const offsetY = this.startY - this.currentY;
      const maxHeight = this.motionElement.offsetHeight;
      let progress = 1 - offsetY / maxHeight;

      progress = Math.min(1, progress); // Limit progress between 0 and 1

      if (progress >= this.threshold) {
        this.statusbar.style.setProperty('--motion-progress', 1);
        this.statusbar.style.setProperty('--overscroll-progress', 0);
        this.titlebar.style.setProperty('--overscroll-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 1);
        this.motionElement.style.setProperty('--overscroll-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.titlebar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.titlebar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
      } else {
        this.statusbar.style.setProperty('--motion-progress', 0);
        this.statusbar.style.setProperty('--overscroll-progress', 0);
        this.titlebar.style.setProperty('--overscroll-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 0);
        this.motionElement.style.setProperty('--overscroll-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.titlebar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.titlebar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
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
      if (progress < 0) {
        progress = 1 + progress;
      }
      const motionProgress = Math.max(0, Math.min(1, progress)); // Limit progress between 0 and 1;
      const overflowProgress = Math.max(1, progress) - 1;
      this.statusbar.style.setProperty('--motion-progress', motionProgress);
      this.statusbar.style.setProperty('--overscroll-progress', overflowProgress);
      this.titlebar.style.setProperty('--overscroll-progress', overflowProgress);
      this.motionElement.style.setProperty('--motion-progress', motionProgress);
      this.motionElement.style.setProperty(
        '--overscroll-progress',
        overflowProgress
      );

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
      this.screen.classList.remove('utility-tray-visible');
      this.statusbar.classList.remove('tray-open');
      this.motionElement.classList.remove('visible');
    },

    showMotionElement: function () {
      this.screen.classList.add('utility-tray-visible');
      this.statusbar.classList.add('tray-open');
      this.motionElement.classList.add('visible');
    },

    resetMotionElement: function () {
      const offsetY = this.startY - this.currentY;
      const maxHeight = this.motionElement.offsetHeight;
      const progress = 1 - offsetY / maxHeight;

      if (progress >= this.threshold) {
        this.statusbar.style.setProperty('--motion-progress', 0);
        this.statusbar.style.setProperty('--overscroll-progress', 0);
        this.titlebar.style.setProperty('--overscroll-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 0);
        this.motionElement.style.setProperty('--overscroll-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.titlebar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.titlebar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
      }
    }
  };

  UtilityTrayMotion.init();
})(window);
