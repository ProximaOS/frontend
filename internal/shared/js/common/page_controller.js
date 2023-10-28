!(function (exports) {
  'use strict';

  const PageController = {
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
      });
    },

    handlePageButtonClick: function (button) {
      if ('SpatialNavigation' in window) {
        SpatialNavigation.makeFocusable();
      }

      const id = button.dataset.pageId;
      const selectedButton = document.querySelector('.page.selected');
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
    }
  };

  PageController.init();

  exports.PageController = PageController;
})(window);
