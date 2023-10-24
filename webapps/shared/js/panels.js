!(function (exports) {
  'use strict';

  if ('Scrollbar' in window) {
    Scrollbar.use(OverscrollPlugin);
  }

  // Panel object
  const Panel = {
    panels: null,

    // Initialize the panel object
    init: function () {
      this.panels = document.querySelectorAll('[role="panel"]');
      this.bindScrollEvents();
    },

    // Bind scroll events to each panel
    bindScrollEvents: function () {
      this.panels.forEach((panel) => {
        const content = panel.querySelector('.content');
        if (!content) {
          return;
        }

        const children = content.querySelectorAll(':scope > *');
        children.forEach((child, index) => {
          child.style.transitionDelay = (500 + (index * 50)) + 'ms';
        });

        if ('Scrollbar' in window) {
          const scrollbar = Scrollbar.init(content, {
            plugins: {
              overscroll: {
                damping: 0.15,
                maxOverscroll: 300,
                effect: 'bounce',
                onScroll: (params) => {
                  if (params.y >= 0) {
                    return;
                  }

                  const scrollPosition = params.y * -1;
                  let progress = scrollPosition / 300;
                  if (progress >= 1) {
                    progress = 1;
                  }

                  this.setOverscrollProgress(panel, progress);
                }
              }
            }
          });

          scrollbar.addListener(() => {
            const scrollPosition = scrollbar.offset.y;
            let progress = scrollPosition / 80;
            if (progress >= 1) {
              progress = 1;
            }

            this.setProgress(panel, progress);
            this.setOverscrollProgress(panel, 0);
          });
        }

        content.addEventListener('scroll', () => {
          const scrollPosition = content.scrollTop;
          let progress = scrollPosition / 80;
          if (progress >= 1) {
            progress = 1;
          }

          this.setProgress(panel, progress);
        });
      });
    },

    // Set progress value on the header bar
    setProgress: function (panel, progress) {
      panel.style.setProperty('--progress', progress);
    },

    setOverscrollProgress: function (panel, progress) {
      panel.style.setProperty('--overscroll-progress', progress);
    }
  };

  // Initialize the Panel object
  Panel.init();
})(window);
