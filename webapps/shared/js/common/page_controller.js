!(function (exports) {
  'use strict';

  const PageController = {
    UNDRAGGABLE_ELEMENTS: [
      'A',
      'BUTTON',
      'INPUT',
      'IMG',
      'LI',
      'WEBVIEW'
    ],

    init: function () {
      const pageButtons = document.querySelectorAll('[data-page-id]');
      pageButtons.forEach((button) => {
        button.addEventListener('click', () =>
          this.handlePageButtonClick(button)
        );
        button.addEventListener('keypress', (event) => {
          if (event.key === 'Enter') {
            this.handlePageButtonClick(button);
          }
        });
      });

      const panels = document.querySelectorAll('[role="panel"]');
      panels.forEach((panel, index) => {
        panel.dataset.index = index;
        panel.classList.add('next');

        let previousPanel = null;
        if (panel.dataset.previousPageId) {
          previousPanel = document.getElementById(panel.dataset.previousPageId);
        }

        panel.addEventListener('mousedown', (event) => this.onPointerDown(event, panel, previousPanel));
        panel.addEventListener('touchstart', (event) => this.onPointerDown(event, panel, previousPanel));
      });
    },

    handlePageButtonClick: function (button) {
      if ('SpatialNavigation' in window) {
        SpatialNavigation.makeFocusable();
      }

      const id = button.dataset.pageId;
      const selectedButton = document.querySelector('.selected');
      const selectedPanel = document.querySelector('[role="panel"].visible');

      if (selectedButton) {
        selectedButton.classList.remove('selected');
      }
      button.classList.add('selected');

      this.togglePanelVisibility(selectedPanel, id);
    },

    togglePanelVisibility: function (selectedPanel, targetPanelId) {
      const targetPanel = document.getElementById(targetPanelId);

      if (selectedPanel) {
        selectedPanel.classList.toggle('visible');
        selectedPanel.classList.toggle(
          'previous',
          selectedPanel.dataset.index <= targetPanel.dataset.index
        );
        selectedPanel.classList.toggle(
          'next',
          selectedPanel.dataset.index >= targetPanel.dataset.index
        );
      }

      targetPanel.classList.toggle('visible');
      targetPanel.classList.toggle(
        'previous',
        selectedPanel.dataset.index <= targetPanel.dataset.index
      );
      targetPanel.classList.toggle(
        'next',
        selectedPanel.dataset.index >= targetPanel.dataset.index
      );
    },

    // Attach event listeners for mouse/touch events to handle dragging
    onPointerDown: function (event, panel, previousPanel) {
      if (this.UNDRAGGABLE_ELEMENTS.indexOf(event.target.nodeName) !== -1) {
        return;
      }
      if (window.matchMedia('(min-width: 768px)').matches) {
        return;
      }
      if (!previousPanel) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      this.startX = event.clientX || event.touches[0].clientX;

      const rtl = (document.dir === 'rtl');

      // Get initial window position
      const initialWindowX = panel.offsetTop;

      // Calculate the offset between the initial position and the window position
      const offsetX = this.startX - initialWindowX;

      // Function to handle dragging
      const dragWindow = (event) => {
        event.preventDefault();
        const x = event.clientX || event.touches[0].clientX;

        // Calculate the new position of the window
        const newWindowX = x - offsetX;

        // Set the new position of the window
        const progress = newWindowX / window.innerHeight;
        panel.classList.add('will-be-visible');
        panel.style.opacity = rtl ? 1 - (progress * -1) : (progress * -1);
        panel.style.visibility = 'visible';
        panel.style.transform = `translateX(${100 * (rtl ? progress : (progress * -1))}%)`;
        previousPanel.classList.add('will-be-visible');
        previousPanel.style.opacity = rtl ? (progress * -1) : 1 - (progress * -1);
        previousPanel.style.visibility = 'visible';
        previousPanel.style.transform = `translateX(${100 * (1 - (rtl ? (progress * -1) : progress))}%)`;
      }

      // Function to stop dragging
      const stopDrag = (event) => {
        event.preventDefault();
        const currentXPosition = event.clientX || event.touches[0].clientX;
        const distanceX = currentXPosition - this.startX;

        panel.classList.add('transitioning');
        panel.addEventListener('transitionend', () => panel.classList.remove('transitioning'));
        panel.classList.remove('dragging');

        let targetDistance = 100;
        if (rtl) {
          targetDistance = -100;
        }

        if (distanceX <= targetDistance) {
          if (panel.id === 'root') {
            panel.style.opacity = null;
            panel.style.transform = '';
          } else {
            panel.classList.remove('will-be-visible');
            panel.classList.remove('visible');
            panel.classList.add('next');
            panel.style.opacity = null;
            panel.style.visibility = null;
            panel.style.transform = null;
            previousPanel.classList.remove('will-be-visible');
            previousPanel.classList.add('visible');
            previousPanel.classList.remove('previous');
            previousPanel.style.opacity = null;
            previousPanel.style.visibility = null;
            previousPanel.style.transform = null;
          }
        } else {
          panel.style.transform = '';
        }

        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('touchmove', dragWindow);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        document.removeEventListener('mouseleave', stopDrag);
        document.removeEventListener('touchcancel', stopDrag);
      }

      // Attach event listeners for dragging
      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('touchmove', dragWindow);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);
      document.addEventListener('mouseleave', stopDrag);
      document.addEventListener('touchcancel', stopDrag);
    }
  };

  PageController.init();

  exports.PageController = PageController;
})(window);
