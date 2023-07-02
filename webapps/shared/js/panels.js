// Panel object
var Panel = {
  panels: null,

  // Initialize the panel object
  init() {
    this.panels = document.querySelectorAll('.panel');
    this.bindScrollEvents();
  },

  // Bind scroll events to each panel
  bindScrollEvents() {
    this.panels.forEach(panel => {
      const content = panel.querySelector('.content');

      content.addEventListener('scroll', () => {
        const scrollPosition = content.scrollTop;
        var progress = scrollPosition / 80;
        if (progress >= 1) {
          progress = 1;
        }

        this.setProgress(panel, progress);
      });
    });
  },

  // Set progress value on the header bar
  setProgress(panel, progress) {
    panel.style.setProperty('--progress', progress);
  }
};

// Initialize the Panel object
Panel.init();
