!(function (exports) {
  'use strict';

  const StickyScroll = {
    isDragging: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
    targetElement: null,
    lastMovementX: 0,
    lastMovementY: 0,
    easing: 0.02,

    smoothMovement: function (newValue, lastValue) {
      return lastValue + (newValue - lastValue) * this.easing;
    },

    handleMouseDown: function (event) {
      this.isDragging = true;
      this.startX = event.pageX;
      this.startY = event.pageY;
      this.targetElement = event.target;
      this.startScrollLeft = this.targetElement.parentElement.scrollLeft;
      this.startScrollTop = this.targetElement.parentElement.scrollTop;
      this.targetElement.style.transition = 'none';
    },

    handleMouseMove: function (event) {
      if (!this.isDragging) return;
      event.preventDefault();
      const x = event.pageX;
      const y = event.pageY;
      const walkX = (x - this.startX) * 2;
      const walkY = (y - this.startY) * 2;

      this.lastMovementX = this.smoothMovement(event.movementX, this.lastMovementX);
      this.lastMovementY = this.smoothMovement(event.movementY, this.lastMovementY);

      const walkWithFrictionX = walkX * 0.9;
      const walkWithFrictionY = walkY * 0.9;

      const easedWalkX =
        Math.sign(walkWithFrictionX) *
        Math.pow(Math.abs(walkWithFrictionX), 1 / 1.2);
      const easedWalkY =
        Math.sign(walkWithFrictionY) *
        Math.pow(Math.abs(walkWithFrictionY), 1 / 1.2);

      this.targetElement.parentElement.scrollLeft =
        this.startScrollLeft - easedWalkX;
      this.targetElement.parentElement.scrollTop =
        this.startScrollTop - easedWalkY;

      this.items.forEach((card) => {
        if (card !== this.targetElement) {
          const cardOffsetX =
            card.offsetLeft - this.targetElement.parentElement.scrollLeft;
          const cardOffsetY =
            card.offsetTop - this.targetElement.parentElement.scrollTop;
          const diffX = Math.abs(x - this.startX);
          const diffY = Math.abs(y - this.startY);
          let translateX, translateY;

          if (walkWithFrictionX > 0) {
            translateX =
              cardOffsetX > x
                ? diffX * (Math.abs(this.lastMovementX / 30) * 0.5)
                : -diffX * Math.abs(this.lastMovementX / 30);
          } else {
            translateX =
              cardOffsetX > x
                ? diffX * Math.abs(this.lastMovementX / 30)
                : -diffX * (Math.abs(this.lastMovementX / 30) * 0.5);
          }

          if (walkWithFrictionY > 0) {
            translateY =
              cardOffsetY > y
                ? diffY * (Math.abs(this.lastMovementY / 30) * 0.5)
                : -diffY * Math.abs(this.lastMovementY / 30);
          } else {
            translateY =
              cardOffsetY > y
                ? diffY * Math.abs(this.lastMovementY / 30)
                : -diffY * (Math.abs(this.lastMovementY / 30) * 0.5);
          }

          card.style.transition = 'none';
          card.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
      });
    },

    handleMouseUp: function (event) {
      this.isDragging = false;
      this.targetElement.style.transition =
        'transform 0.5s cubic-bezier(0.2, 0.9, 0.1, 1.1)';
      const cards =
        this.targetElement.parentElement.querySelectorAll('.carousel-card');

      cards.forEach((card) => {
        card.style.transition =
          'transform 0.5s cubic-bezier(0.2, 0.9, 0.1, 1.1)';
        card.style.transform = 'none';
      });
    },

    init: function (element, items) {
      this.items = element.querySelectorAll(items);
      this.items.forEach((card) => {
        card.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        card.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        card.addEventListener('mouseup', (event) => this.handleMouseUp(event));
      });
    },

    destroy: function (element, items) {
      this.items = element.querySelectorAll(items);
      this.items.forEach((card) => {
        card.removeEventListener('mousedown', (event) => this.handleMouseDown(event));
        card.removeEventListener('mousemove', (event) => this.handleMouseMove(event));
        card.removeEventListener('mouseup', (event) => this.handleMouseUp(event));
      });
    }
  };

  exports.StickyScroll = StickyScroll;
})(window);
