const SwipeDirection = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

const SwipeEvent = {
  arrowElement: null,
  direction: null,
  progress: 0,
  onComplete: null,

  init: function(arrowId, direction, onComplete) {
    this.arrowElement = document.getElementById(arrowId);
    this.direction = direction;
    this.onComplete = onComplete;

    // Add event listeners to track the user's swipe
    this.arrowElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  },

  handleMouseDown: function(event) {
    this.progress = 0;
  },

  handleMouseUp: function(event) {
    if (this.progress >= 1) {
      // Swipe completed successfully
      if (this.onComplete) {
        this.onComplete();
      }
    }
    this.progress = 0;
  },

  handleMouseMove: function(event) {
    const rect = this.arrowElement.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    let angle = Math.atan2(event.clientY - center.y, event.clientX - center.x);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    const directionAngle = this.getDirectionAngle(this.direction);
    const angleDiff = Math.abs(angle - directionAngle);

    // Calculate the progress based on the angle difference
    const maxAngleDiff = Math.PI / 2;
    if (angleDiff <= maxAngleDiff) {
      this.progress = (maxAngleDiff - angleDiff) / maxAngleDiff;
    } else {
      this.progress = 0;
    }

    // Update the arrow element rotation
    this.arrowElement.style.transform = `rotate(${angle}rad)`;
  },

  getDirectionAngle: function(direction) {
    switch (direction) {
      case SwipeDirection.UP:
        return -Math.PI / 2;
      case SwipeDirection.DOWN:
        return Math.PI / 2;
      case SwipeDirection.LEFT:
        return Math.PI;
      case SwipeDirection.RIGHT:
        return 0;
    }
  },
};
