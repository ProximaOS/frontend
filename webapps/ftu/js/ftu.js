!(function (exports) {
  'use strict';

  const FTU = {
    content: document.getElementById('content'),
    splashscreen: document.getElementById('splashscreen'),

    init: function () {
      this.setup();
      this.splashscreen.classList.add('hidden');
    },

    setup: function () {
      this.content.classList.add('visible');
      this.content.onclick = () => {
        if (process.platform === 'win32') {
          new Audio('file://C:/Windows/Media/Windows Background.wav').play();
        } else {
          new Audio('/resources/sounds/exclamation.wav').play();
        }
        this.content.classList.add('alert');
        this.content.addEventListener('transitionend', () => {
          this.content.classList.remove('alert');
        });
      };

      this.content.querySelector('.container').onclick = (event) => {
        event.stopPropagation();
      };

      const pageButtons = this.content.querySelectorAll('[data-page-id]');
      pageButtons.forEach((button) => {
        button.addEventListener('click', () => this.handlePageButtonClick(button));
      });

      const panels = this.content.querySelectorAll('.page');
      panels.forEach((panel, index) => {
        panel.dataset.index = index;
        panel.classList.add('next');
      });

      const doneButton = this.content.querySelector('.done-button');
      doneButton.onclick = () => {
        window.close();
      };

      const accentColorRed = this.content.querySelector('.accent-colors .red');
      const accentColorYellow = this.content.querySelector('.accent-colors .yellow');
      const accentColorGreen = this.content.querySelector('.accent-colors .green');
      const accentColorBlue = this.content.querySelector('.accent-colors .blue');
      const accentColorPurple = this.content.querySelector('.accent-colors .purple');

      accentColorRed.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 192);
        document.scrollingElement.style.setProperty('--accent-color-g', 0);
        document.scrollingElement.style.setProperty('--accent-color-b', 64);
        window.Settings.setValue('homescreen.accent_color.rgb', {
          r: 192,
          g: 0,
          b: 64
        });
      };
      accentColorYellow.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 255);
        document.scrollingElement.style.setProperty('--accent-color-g', 192);
        document.scrollingElement.style.setProperty('--accent-color-b', 0);
        window.Settings.setValue('homescreen.accent_color.rgb', {
          r: 255,
          g: 192,
          b: 0
        });
      };
      accentColorGreen.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 64);
        document.scrollingElement.style.setProperty('--accent-color-g', 160);
        document.scrollingElement.style.setProperty('--accent-color-b', 96);
        window.Settings.setValue('homescreen.accent_color.rgb', {
          r: 64,
          g: 160,
          b: 96
        });
      };
      accentColorBlue.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', null);
        document.scrollingElement.style.setProperty('--accent-color-g', null);
        document.scrollingElement.style.setProperty('--accent-color-b', null);
        window.Settings.setValue('homescreen.accent_color.rgb', {
          r: null,
          g: null,
          b: null
        });
      };
      accentColorPurple.onclick = () => {
        document.scrollingElement.style.setProperty('--accent-color-r', 128);
        document.scrollingElement.style.setProperty('--accent-color-g', 48);
        document.scrollingElement.style.setProperty('--accent-color-b', 160);
        window.Settings.setValue('homescreen.accent_color.rgb', {
          r: 128,
          g: 48,
          b: 160
        });
      };
    },

    handlePageButtonClick: function (button) {
      const id = button.dataset.pageId;
      const selectedPanel = this.content.querySelector('.page.visible');

      this.togglePanelVisibility(selectedPanel, id);
    },

    togglePanelVisibility: function (selectedPanel, targetPanelId) {
      const targetPanel = this.content.querySelector(`.${targetPanelId}`);

      if (selectedPanel) {
        selectedPanel.classList.toggle('visible');
        selectedPanel.classList.toggle('previous', selectedPanel.dataset.index <= targetPanel.dataset.index);
        selectedPanel.classList.toggle('next', selectedPanel.dataset.index >= targetPanel.dataset.index);
      }

      targetPanel.classList.toggle('visible');
      targetPanel.classList.toggle('previous', selectedPanel.dataset.index <= targetPanel.dataset.index);
      targetPanel.classList.toggle('next', selectedPanel.dataset.index >= targetPanel.dataset.index);
    }
  };

  FTU.init();

  exports.FTU = FTU;
})(window);
