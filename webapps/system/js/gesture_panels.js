!(function (exports) {
  'use strict';

  const GesturePanels = {
    screen: document.getElementById('screen'),
    wallpapersContainer: document.getElementById('wallpapers'),
    windowContainer: document.getElementById('windows'),
    topPanel: document.getElementById('top-panel'),
    leftPanel: document.getElementById('left-panel'),
    rightPanel: document.getElementById('right-panel'),
    bottomPanel: document.getElementById('bottom-panel'),

    isDragging: false,
    startY: false,

    init: function () {
      this.bottomPanel.addEventListener('touchstart', this.handleBottomPanel.bind(this));
      this.bottomPanel.addEventListener('mousedown', this.handleBottomPanel.bind(this));
      document.addEventListener('touchmove', this.handlePointerMove.bind(this));
      document.addEventListener('mousemove', this.handlePointerMove.bind(this));
      document.addEventListener('touchend', this.handlePointerUp.bind(this));
      document.addEventListener('mouseup', this.handlePointerUp.bind(this));

      document.addEventListener('click', () => {
        this.screen.classList.remove('close-reach');
      });
    },

    handleBottomPanel: function (event) {
      event.preventDefault();
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.isDragging = true;
      this.windowContainer.classList.add('dragging');
    },

    // Add the following event handler for touchmove and pointermove events on the grippy bar
    handlePointerMove: function (event) {
      event.preventDefault();
      if (this.isDragging) {
        const currentXPosition = event.clientX;
        const currentYPosition = event.clientY;
        const distanceX = currentXPosition - this.startX;
        const distanceY = currentYPosition - this.startY;

        const translateX = distanceX / 2;
        const translateY = Math.min(0, distanceY / 2);
        const scale = Math.min(1, window.innerHeight / (window.innerHeight - distanceY));

        const focusedWindow = new AppWindow().getFocusedWindow().element;

        // Move the window along the Y-axis based on the dragging distance
        if (!focusedWindow.dataset.oldTransformOrigin) {
          focusedWindow.dataset.oldTransformOrigin = focusedWindow.style.transformOrigin;
        }
        if (focusedWindow.id === 'homescreen') {
          focusedWindow.style.transformOrigin = 'center';
          this.wallpapersContainer.classList.add('homescreen-to-cards-view');
          this.wallpapersContainer.style.setProperty('--motion-progress', Math.min(1, (1 - scale) * 2));
          focusedWindow.style.transform = `scale(${0.75 + scale * 0.25})`;
          focusedWindow.style.setProperty('--offset-x', 0);
          focusedWindow.style.setProperty('--offset-y', 0);
          focusedWindow.style.setProperty('--scale', scale);
        } else {
          focusedWindow.style.transformOrigin = 'center bottom';
          focusedWindow.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          focusedWindow.style.setProperty('--offset-x', `${translateX}px`);
          focusedWindow.style.setProperty('--offset-y', `${translateY}px`);
          focusedWindow.style.setProperty('--scale', scale);
        }
      }
    },

    handlePointerUp: function (event) {
      event.preventDefault();
      if (this.isDragging) {
        const currentXPosition = event.clientX;
        const currentYPosition = event.clientY;
        const distanceX = currentXPosition - this.startX;
        const distanceY = currentYPosition - this.startY;

        const focusedWindow = new AppWindow().getFocusedWindow().element;

        // Reset the window transform
        focusedWindow.style.transformOrigin = focusedWindow.dataset.oldTransformOrigin;

        this.startX = null;
        this.startY = null;
        this.isDragging = false;

        this.windowContainer.classList.remove('dragging');
        if (distanceY <= -300) {
          CardsView.show();
        } else if (distanceY <= -50) {
          CardsView.hide();
          if (focusedWindow) {
            Webapps.getWindowById(focusedWindow.id).minimize();
            focusedWindow.style.transform = '';
          } else {
            Webapps.getWindowById('homescreen').focus();
          }
        } else if (distanceY >= 5) {
          CardsView.hide();
          requestAnimationFrame(() => {
            this.screen.classList.add('close-reach');
          });
        } else {
          focusedWindow.classList.add('transitioning');
          focusedWindow.addEventListener('transitionend', () => {
            focusedWindow.classList.remove('transitioning');
          });
        }
        focusedWindow.style.transform = '';
      }
    }
  };

  GesturePanels.init();
})(window);
