const UtilityTrayMotion = {
  statusbar: document.getElementById('statusbar'),
  motionElement: document.getElementById('utility-tray-motion'),
  startY: 0,
  currentY: 0,
  isDragging: false,
  threshold: 0.75, // Adjust the threshold as desired (0.0 to 1.0)

  init: function() {
    this.statusbar.addEventListener('pointerdown', this.onPointerDown.bind(this));
    document.addEventListener('pointermove', this.onPointerMove.bind(this));
    document.addEventListener('pointerup', this.onPointerUp.bind(this));
    document.addEventListener('pointerleave', this.onPointerUp.bind(this));

    this.motionElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    document.addEventListener('pointermove', this.onPointerMove.bind(this));
    document.addEventListener('pointerup', this.onPointerUp.bind(this));
    document.addEventListener('pointerleave', this.onPointerUp.bind(this));
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

    if (progress >= this.threshold) {
      this.motionElement.style.setProperty('--motion-progress', 1);
    } else {
      this.motionElement.style.setProperty('--motion-progress', 0);
      this.hideMotionElement();
    }

    this.isDragging = false;
  },

  onPointerCancel: function() {
    this.resetMotionElement();
    this.isDragging = false;
  },

  updateMotionProgress: function(progress) {
    const motionProgress = 1 - progress;
    this.motionElement.style.setProperty('--motion-progress', motionProgress);

    if (motionProgress <= this.threshold) {
      this.motionElement.classList.add('fade-out');
      this.motionElement.classList.remove('fade-in');
    } else {
      this.showMotionElement();
      this.motionElement.classList.add('fade-in');
      this.motionElement.classList.remove('fade-out');
    }
  },

  hideMotionElement: function() {
    this.motionElement.classList.remove('visible');
  },

  showMotionElement: function() {
    this.motionElement.classList.add('visible');
  },

  resetMotionElement: function() {
    const offsetY = this.startY - this.currentY;
    const maxHeight = this.motionElement.offsetHeight;
    const progress = 1 - offsetY / maxHeight;

    if (progress >= this.threshold) {
      this.motionElement.style.setProperty('--motion-progress', 1);
    }
  }
};

UtilityTrayMotion.init();
