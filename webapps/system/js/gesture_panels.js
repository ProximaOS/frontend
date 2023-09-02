!(function (exports) {
  'use strict';

  const GesturePanels = {
    topPanel: document.getElementById('top-panel'),
    leftPanel: document.getElementById('left-panel'),
    rightPanel: document.getElementById('right-panel'),
    bottomPanel: document.getElementById('bottom-panel'),

    isDragging: false,
    startY: false,

    init: function () {
      this.bottomPanel.addEventListener('mousedown', this.handleBottomPanel.bind(this));

      document.addEventListener('touchend', this.handlePointerUp.bind(this));
      document.addEventListener('mouseup', this.handlePointerUp.bind(this));
      document.addEventListener('touchmove', this.handlePointerMove.bind(this));
      document.addEventListener(
        'mousemove',
        this.handlePointerMove.bind(this)
      );
    },

    handleBottomPanel: function (event) {
      event.preventDefault();
      this.startY = event.clientY;
      this.isDragging = true;
      AppWindow.containerElement.classList.add('dragging');
    },

    // Add the following event handler for touchmove and pointermove events on the grippy bar
    handlePointerMove: function (event) {
      event.preventDefault();
      if (this.isDragging) {
        const currentYPosition = event.clientY;
        const distanceY = currentYPosition - this.startY;

        // Move the window along the Y-axis based on the dragging distance
        if (!AppWindow.focusedWindow.dataset.oldTransformOrigin) {
          AppWindow.focusedWindow.dataset.oldTransformOrigin =
            AppWindow.focusedWindow.style.transformOrigin;
        }
        AppWindow.focusedWindow.style.transformOrigin = 'center bottom';
        AppWindow.focusedWindow.style.transform = `translateY(${
          distanceY / 2
        }px) scale(${window.innerHeight / (window.innerHeight - distanceY)})`;
        CardsView.element.style.setProperty('--offset-y', `${distanceY / 2}px`);
        CardsView.element.style.setProperty('--scale', window.innerHeight / (window.innerHeight - distanceY));
        AppWindow.focusedWindow.style.setProperty('--offset-y', `${distanceY / 2}px`);
        AppWindow.focusedWindow.style.setProperty('--scale', window.innerHeight / (window.innerHeight - distanceY));
      }
    },

    handlePointerUp: function (event) {
      event.preventDefault();
      if (this.isDragging) {
        const currentYPosition = event.clientY;
        const distanceY = currentYPosition - this.startY;

        // Reset the window transform
        AppWindow.focusedWindow.style.transformOrigin =
          AppWindow.focusedWindow.dataset.oldTransformOrigin;

        this.startY = null;
        this.isDragging = false;

        AppWindow.containerElement.classList.remove('dragging');
        console.log(distanceY);
        if (distanceY <= -300) {
          CardsView.show();
        } else if (distanceY <= -100) {
          AppWindow.minimize(AppWindow.focusedWindow.id);
        } else {
          AppWindow.focusedWindow.classList.add('transitioning');
          AppWindow.focusedWindow.addEventListener('transitionend', () => {
            AppWindow.focusedWindow.classList.remove('transitioning');
          });
        }
        AppWindow.focusedWindow.style.transform = '';
        AppWindow.focusedWindow.style.transformOrigin = 'center';
      }
    }
  };

  GesturePanels.init();
})(window);
