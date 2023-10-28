!(function (exports) {
  'use strict';

  // CardPanel object
  const CardPanel = {
    cardPanels: null,

    isDragging: false,
    initialY: null,
    currentY: null,

    // Initialize the panel object
    init: function () {
      this.cardPanels = document.querySelectorAll('.card-panel');
      this.bindCardEvents();
    },

    bindCardEvents: function () {
      this.cardPanels.forEach((cardPanel) => {
        const handle = cardPanel.querySelector('.card > .handle');

        cardPanel.addEventListener('touchstart', (event) => this.onTouchStart(event, cardPanel));
        document.addEventListener('touchmove', (event) => this.onTouchMove(event, cardPanel));
        document.addEventListener('touchend', (event) => this.onTouchEnd(event, cardPanel));

        handle.addEventListener('mousedown', (event) => this.onMouseDown(event, cardPanel));
        document.addEventListener('mousemove', (event) => this.onMouseMove(event, cardPanel));
        document.addEventListener('mouseup', (event) => this.onMouseUp(event, cardPanel));
      });
    },

    onTouchStart: function (event, cardPanel) {
      this.initialY = event.touches[0].clientY;
      this.isDragging = true;
      cardPanel.classList.add('dragging');
    },

    onTouchMove: function (event, cardPanel) {
      if (!this.isDragging) return;
      this.currentY = event.touches[0].clientY;
      const diffY = this.currentY - this.initialY;
      const translateY = diffY > 0 ? diffY : (diffY / 10);
      cardPanel.style.setProperty('--card-progress', translateY / cardPanel.offsetHeight);
    },

    onTouchEnd: function (event, cardPanel) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.initialY = null;
      this.currentY = null;

      if (cardPanel.children[0].getBoundingClientRect().top >= (cardPanel.children[0].offsetHeight / 4) * 3) {
        cardPanel.classList.remove('visible');
      } else {
        cardPanel.classList.add('visible');
      }
      cardPanel.style.setProperty('--card-progress', 0);
      cardPanel.classList.remove('dragging');
    },

    onMouseDown: function (event, cardPanel) {
      this.initialY = event.clientY;
      this.isDragging = true;
      cardPanel.classList.add('dragging');
    },

    onMouseMove: function (event, cardPanel) {
      if (!this.isDragging) return;
      this.currentY = event.clientY;
      const diffY = this.currentY - this.initialY;
      const translateY = diffY > 0 ? diffY : (diffY / 10);
      cardPanel.style.setProperty('--card-progress', translateY / cardPanel.offsetHeight);
    },

    onMouseUp: function (event, cardPanel) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.initialY = null;
      this.currentY = null;

      if (cardPanel.children[0].getBoundingClientRect().top >= (cardPanel.children[0].offsetHeight / 4) * 3) {
        cardPanel.classList.remove('visible');
      } else {
        cardPanel.classList.add('visible');
      }
      cardPanel.style.setProperty('--card-progress', 0);
      cardPanel.classList.remove('dragging');
      console.log(cardPanel.children[0].getBoundingClientRect().top, (cardPanel.children[0].offsetHeight / 4) * 3);
    }
  };

  // Initialize the CardPanel object
  CardPanel.init();

  exports.CardPanel = CardPanel;
})(window);
