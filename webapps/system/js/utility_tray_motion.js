!(function (exports) {
  'use strict';

  const UtilityTrayMotion = {
    statusbar: document.getElementById('statusbar'),
    motionElement: document.getElementById('utility-tray-motion'),
    controlCenter: document.getElementById('control-center'),
    notifications: document.getElementById('notifications'),
    startY: 0,
    currentY: 0,
    isDragging: false,
    threshold: 0.75, // Adjust the threshold as desired (0.0 to 1.0)

    init: function () {
      this.statusbar.addEventListener(
        'pointerdown',
        this.onPointerDown.bind(this)
      );
      this.motionElement.addEventListener(
        'pointerdown',
        this.onPointerDown.bind(this)
      );
      document.addEventListener('pointermove', this.onPointerMove.bind(this));
      document.addEventListener('pointerup', this.onPointerUp.bind(this));
      document.addEventListener('pointerleave', this.onPointerUp.bind(this));
    },

    onPointerDown: function (event) {
      event.preventDefault();
      this.startY = event.clientY;
      this.currentY = this.startY;
      this.isDragging = true;
      this.statusbar.classList.add('tray-open');
    },

    onPointerMove: function (event) {
      event.preventDefault();

      if (this.isDragging) {
        if (event.target === this.statusbar && this.motionElement.classList.contains('visible')) {
          if (event.clientX >= window.innerWidth / 2) {
            this.controlCenter.classList.add('hidden');
            this.notifications.classList.remove('hidden');
          } else {
            this.controlCenter.classList.remove('hidden');
            this.notifications.classList.add('hidden');
          }
        }

        this.currentY = event.clientY;
        const offsetY = this.startY - this.currentY;
        const maxHeight = this.motionElement.offsetHeight;
        const progress = offsetY / maxHeight;

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
        this.statusbar.style.setProperty('--overflow-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 1);
        this.motionElement.style.setProperty('--overflow-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
      } else {
        this.statusbar.style.setProperty('--motion-progress', 0);
        this.statusbar.style.setProperty('--overflow-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 0);
        this.motionElement.style.setProperty('--overflow-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
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
      const motionProgress = 1 - Math.max(0, Math.min(1, progress)); // Limit progress between 0 and 1;
      const overflowProgress = 1 - (Math.min(0, progress) + 1);
      this.statusbar.style.setProperty('--motion-progress', motionProgress);
      this.statusbar.style.setProperty(
        '--overflow-progress',
        overflowProgress
      );
      this.motionElement.style.setProperty('--motion-progress', motionProgress);
      this.motionElement.style.setProperty(
        '--overflow-progress',
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
      this.statusbar.classList.remove('tray-open');
      this.motionElement.classList.remove('visible');
    },

    showMotionElement: function () {
      this.statusbar.classList.add('tray-open');
      this.motionElement.classList.add('visible');
    },

    resetMotionElement: function () {
      const offsetY = this.startY - this.currentY;
      const maxHeight = this.motionElement.offsetHeight;
      const progress = 1 - offsetY / maxHeight;

      if (progress >= this.threshold) {
        this.statusbar.style.setProperty('--motion-progress', 0);
        this.statusbar.style.setProperty('--overflow-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 0);
        this.motionElement.style.setProperty('--overflow-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
      }
    }
  };

  UtilityTrayMotion.init();
})(window);
