!(function (exports) {
  'use strict';

  const GesturePanels = {
    screen: document.getElementById('screen'),
    wallpapersContainer: document.getElementById('wallpapers'),
    topPanel: document.getElementById('top-panel'),
    leftPanel: document.getElementById('left-panel'),
    rightPanel: document.getElementById('right-panel'),
    bottomPanel: document.getElementById('bottom-panel'),

    isDragging: false,
    startY: false,

    init: function () {
      this.bottomPanel.addEventListener(
        'mousedown',
        this.handleBottomPanel.bind(this)
      );

      document.addEventListener('touchend', this.handlePointerUp.bind(this));
      document.addEventListener('mouseup', this.handlePointerUp.bind(this));
      document.addEventListener('touchmove', this.handlePointerMove.bind(this));
      document.addEventListener('mousemove', this.handlePointerMove.bind(this));

      document.addEventListener('click', () => {
        this.screen.classList.remove('close-reach');
      });
    },

    handleBottomPanel: function (event) {
      event.preventDefault();
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.isDragging = true;
      AppWindow.containerElement.classList.add('dragging');
    },

    // Add the following event handler for touchmove and pointermove events on the grippy bar
    handlePointerMove: function (event) {
      event.preventDefault();
      if (this.isDragging) {
        const currentXPosition = event.clientX;
        const currentYPosition = event.clientY;
        const distanceX = currentXPosition - this.startX;
        const distanceY = currentYPosition - this.startY;

        const translateX = Math.min(0, distanceX / 2);
        const translateY = Math.min(0, distanceY / 2);
        const scale = Math.min(
          1,
          window.innerHeight / (window.innerHeight - distanceY)
        );

        // Move the window along the Y-axis based on the dragging distance
        if (!AppWindow.focusedWindow.dataset.oldTransformOrigin) {
          AppWindow.focusedWindow.dataset.oldTransformOrigin =
            AppWindow.focusedWindow.style.transformOrigin;
        }
        if (AppWindow.focusedWindow.id === 'homescreen') {
          AppWindow.focusedWindow.style.transformOrigin = 'center';
          this.wallpapersContainer.classList.add('homescreen-to-cards-view');
          this.wallpapersContainer.style.setProperty(
            '--motion-progress',
            Math.min(1, (1 - scale) * 2)
          );
          AppWindow.focusedWindow.style.transform = `scale(${
            0.75 + scale * 0.25
          })`;
          AppWindow.focusedWindow.style.setProperty('--offset-x', 0);
          AppWindow.focusedWindow.style.setProperty('--offset-y', 0);
          AppWindow.focusedWindow.style.setProperty('--scale', scale);
        } else {
          AppWindow.focusedWindow.style.transformOrigin = 'center bottom';
          AppWindow.focusedWindow.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          AppWindow.focusedWindow.style.setProperty(
            '--offset-x',
            `${translateX}px`
          );
          AppWindow.focusedWindow.style.setProperty(
            '--offset-y',
            `${translateY}px`
          );
          AppWindow.focusedWindow.style.setProperty('--scale', scale);
        }

        if (distanceY <= -300) {
          CardsView.element.classList.add('will-be-visible');
          if (AppWindow.focusedWindow.id !== 'homescreen') {
            CardsView.element.style.setProperty(
              '--offset-x',
              `${translateX}px`
            );
            CardsView.element.style.setProperty(
              '--offset-y',
              `${translateY}px`
            );
          }
          CardsView.element.style.setProperty('--scale', scale);
        } else {
          CardsView.element.classList.remove('will-be-visible');
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

        // Reset the window transform
        AppWindow.focusedWindow.style.transformOrigin =
          AppWindow.focusedWindow.dataset.oldTransformOrigin;

        this.startX = null;
        this.startY = null;
        this.isDragging = false;

        AppWindow.containerElement.classList.remove('dragging');
        if (distanceY <= -300) {
          CardsView.element.classList.remove('will-be-visible');
          CardsView.show();
        } else if (distanceY <= -50) {
          AppWindow.minimize(AppWindow.focusedWindow.id);
        } else if (distanceY >= 0) {
          setTimeout(() => {
            this.screen.classList.add('close-reach');
          }, 16);
        } else {
          AppWindow.focusedWindow.classList.add('transitioning');
          AppWindow.focusedWindow.addEventListener('transitionend', () => {
            AppWindow.focusedWindow.classList.remove('transitioning');
          });
        }
        AppWindow.focusedWindow.style.transform = '';
      }
    }
  };

  GesturePanels.init();
})(window);
