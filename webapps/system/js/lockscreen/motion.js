const LockscreenMotion = {
  motionElement: document.getElementById('lockscreen'),
  lockscreenIcon: document.getElementById('lockscreen-icon'),
  startY: 0,
  currentY: 0,
  isDragging: false,
  threshold: 0.75, // Adjust the threshold as desired (0.0 to 1.0)

  lockSound: new Audio('/resources/sounds/lock.wav'),
  unlockSound: new Audio('/resources/sounds/unlock.opus'),

  init: function() {
    document.addEventListener('keyup', this.onKeyPress.bind(this));

    this.motionElement.addEventListener('dblclick', this.onDoubleTap.bind(this));
    this.motionElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    document.addEventListener('pointermove', this.onPointerMove.bind(this));
    document.addEventListener('pointerup', this.onPointerUp.bind(this));

    this.showMotionElement();
  },

  onKeyPress: function(event) {
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

  onDoubleTap: function() {
    this.motionElement.classList.toggle('low-power');
  },

  onPointerDown: function(event) {
    event.preventDefault();
    this.startY = event.clientY;
    this.currentY = this.startY;
    this.isDragging = true;
  },

  onPointerMove: function(event) {
    event.preventDefault();

    if (this.isDragging) {
      this.currentY = event.clientY;
      const offsetY = this.startY - this.currentY;
      const maxHeight = this.motionElement.offsetHeight;
      var progress = offsetY / maxHeight;

      progress = Math.max(0, Math.min(1, progress)); // Limit progress between 0 and 1

      this.updateMotionProgress(progress); // Update motion element opacity
    }
  },

  onPointerUp: function() {
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
      this.hideMotionElement();
    }

    this.isDragging = false;
  },

  updateMotionProgress: function(progress) {
    const motionProgress = 1 - progress;
    this.motionElement.style.setProperty('--motion-progress', motionProgress);

    if (motionProgress <= this.threshold) {
    } else {
      this.showMotionElement();
    }
  },

  hideMotionElement: function() {
    if (this.isDragging) {
      this.unlockSound.play();
    }

    this.motionElement.classList.add('transitioning');
    this.motionElement.classList.remove('visible');
    TimeIcon.iconElement.classList.remove('hidden');

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.motionElement.classList.remove('transitioning');
    }, 500);
  },

  showMotionElement: function() {
    this.motionElement.classList.add('visible');
    this.motionElement.classList.remove('transitioning');
    TimeIcon.iconElement.classList.add('hidden');
  },

  resetMotionElement: function() {
    this.motionElement.classList.add('transitioning');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.motionElement.classList.remove('transitioning');
    }, 500);
    this.motionElement.style.setProperty('--motion-progress', 1);
  }
};

LockscreenMotion.init();
