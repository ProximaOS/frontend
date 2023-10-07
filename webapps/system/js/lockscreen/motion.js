!(function (exports) {
  'use strict';

  const LockscreenMotion = {
    motionElement: document.getElementById('lockscreen'),
    lockscreenIcon: document.getElementById('lockscreen-icon'),
    cameraButton: document.getElementById('lockscreen-camera-button'),
    flashlightButton: document.getElementById('lockscreen-flashlight-button'),
    notifications: document.getElementById('lockscreen-notifications'),
    notificationBadge: document.getElementById('lockscreen-notification-badge'),

    isPINLocked: false,
    startY: 0,
    currentY: 0,
    isDragging: false,
    threshold: 0.75, // Adjust the threshold as desired (0.0 to 1.0)

    lockSound: new Audio('/resources/sounds/lock.wav'),
    unlockSound: new Audio('/resources/sounds/unlock.wav'),

    init: function () {
      Settings.getValue('lockscreen.type').then((value) => {
        if (value === 'pin') {
          this.isPINLocked = true;
        } else {
          this.isPINLocked = false;
        }
      });
      Settings.addObserver('lockscreen.type', (value) => {
        if (value === 'pin') {
          this.isPINLocked = true;
        } else {
          this.isPINLocked = false;
        }
      });

      this.notificationBadge.addEventListener(
        'click',
        this.handleNotificationBadgeClick.bind(this)
      );
      document.addEventListener('keyup', this.onKeyPress.bind(this));

      this.motionElement.addEventListener(
        'dblclick',
        this.onDoubleTap.bind(this)
      );
      this.motionElement.addEventListener(
        'pointerdown',
        this.onPointerDown.bind(this)
      );
      document.addEventListener('pointermove', this.onPointerMove.bind(this));
      document.addEventListener('pointerup', this.onPointerUp.bind(this));

      this.cameraButton.addEventListener(
        'click',
        this.handleCameraButton.bind(this)
      );
      DirectionalScale.init(this.cameraButton);
      DirectionalScale.init(this.flashlightButton);

      this.showMotionElement();
    },

    handleNotificationBadgeClick: function (event) {
      this.notifications.classList.add('visible');
      this.notificationBadge.classList.add('hidden');
    },

    onKeyPress: function (event) {
      switch (event.code) {
        case 'End':
          this.showMotionElement();
          this.resetMotionElement();
          this.isDragging = false;
          break;

        default:
          break;
      }
    },

    onDoubleTap: function () {
      this.motionElement.classList.toggle('low-power');
    },

    onPointerDown: function (event) {
      if (
        event.target.nodeName === 'A' ||
        event.target.nodeName === 'BUTTON' ||
        event.target.nodeName === 'INPUT'
      ) {
        return;
      }

      this.startY = event.clientY;
      this.currentY = this.startY;
      this.isDragging = true;

      if (this.isPINLocked) {
        this.motionElement.classList.add('pin-lock');
      } else {
        this.motionElement.classList.remove('pin-lock');
      }
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
        this.currentY = event.clientY;
        const offsetY = this.startY - this.currentY;
        const maxHeight = this.motionElement.offsetHeight;
        let progress = offsetY / maxHeight;

        progress = Math.max(0, Math.min(1, progress)); // Limit progress between 0 and 1

        this.updateMotionProgress(progress); // Update motion element opacity
      }
    },

    onPointerUp: function () {
      const offsetY = this.startY - this.currentY;
      const maxHeight = this.motionElement.offsetHeight;
      const progress = 1 - offsetY / maxHeight;

      this.motionElement.classList.add('transitioning');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.motionElement.classList.remove('transitioning');
      }, 500);

      if (progress >= this.threshold) {
        this.motionElement.style.setProperty('--motion-progress', 1);
        this.lockscreenIcon.classList.add('fail-unlock');
        this.lockscreenIcon.onanimationend = () => {
          this.lockscreenIcon.classList.remove('fail-unlock');
        };
      } else {
        this.motionElement.style.setProperty('--motion-progress', 0);
        if (!this.isPINLocked) {
          this.hideMotionElement();
        } else {
          this.showMotionElementPIN();
        }
      }

      this.isDragging = false;
    },

    updateMotionProgress: function (progress) {
      const motionProgress = 1 - progress;
      this.motionElement.style.setProperty('--motion-progress', motionProgress);

      if (motionProgress >= this.threshold) {
        this.showMotionElement();
      }
    },

    hideMotionElement: function () {
      if (this.isDragging) {
        this.unlockSound.currentTime = 0;
        this.unlockSound.play();
      }

      this.motionElement.classList.add('transitioning');
      this.motionElement.classList.remove('visible');
      this.motionElement.classList.remove('pin-lock-visible');
      TimeIcon.iconElement.classList.remove('hidden');

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.motionElement.classList.remove('transitioning');
      }, 500);

      IPC.send('message', {
        type: 'lockscreen',
        action: 'unlock'
      });
      WallpaperManager.playVideoInStyle();
    },

    showMotionElementPIN: function () {
      this.motionElement.classList.add('transitioning');
      this.motionElement.classList.add('pin-lock-visible');
      TimeIcon.iconElement.classList.remove('hidden');

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.motionElement.classList.remove('transitioning');
      }, 500);
    },

    showMotionElement: function () {
      if (!this.isDragging) {
        if (!this.motionElement.classList.contains('visible')) {
          this.lockSound.currentTime = 0;
          this.lockSound.play();
        }
      }
      this.notifications.classList.remove('visible');
      this.notificationBadge.classList.remove('hidden');

      this.motionElement.classList.add('visible');
      this.motionElement.classList.remove('transitioning');
      TimeIcon.iconElement.classList.add('hidden');

      IPC.send('message', {
        type: 'lockscreen',
        action: 'lock'
      });
    },

    resetMotionElement: function () {
      this.motionElement.classList.add('transitioning');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.motionElement.classList.remove('transitioning');
      }, 500);
      this.motionElement.style.setProperty('--motion-progress', 1);
    },

    handleCameraButton: function () {
      AppWindow.create(
        `http://camera.localhost:${location.port}/manifest.json`,
        {}
      );
      if (!this.isPINLocked) {
        this.hideMotionElement();
      } else {
        this.showMotionElementPIN();
      }
    }
  };

  LockscreenMotion.init();

  exports.LockscreenMotion = LockscreenMotion;
})(window);
