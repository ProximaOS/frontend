!(function (exports) {
  'use strict';

  const Sketch = {
    canvas: document.getElementById('paintCanvas'),
    context: document.getElementById('paintCanvas').getContext('2d'),
    colorPicker: document.getElementById('colorPicker'),
    lineWidth: document.getElementById('lineWidth'),
    opacity: document.getElementById('opacity'),
    presetColors: document.getElementById('presetColors'),

    painting: false,
    zoomLevel: 1,

    init: function () {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;

      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
      this.context.strokeStyle = this.colorPicker.value;
      this.context.lineWidth = this.lineWidth.value;
      this.context.globalAlpha = this.opacity.value;

      window.addEventListener('load', this.handleResize.bind(this));
      window.addEventListener('resize', this.handleResize.bind(this));
      this.canvas.addEventListener('mousedown', this.startPainting.bind(this));
      this.canvas.addEventListener('mouseup', this.stopPainting.bind(this));
      this.canvas.addEventListener('mousemove', this.draw.bind(this));
      this.colorPicker.addEventListener('change', this.updateColor.bind(this));
      this.lineWidth.addEventListener('input', this.updateLineWidth.bind(this));
      this.opacity.addEventListener('input', this.updateOpacity.bind(this));
      this.presetColors.addEventListener('change', this.usePresetColor.bind(this));
      this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    },

    handleResize: function () {
      this.canvas.width = null;
      this.canvas.height = null;
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
    },

    startPainting: function (event) {
      this.painting = true;
      this.draw(event);
    },

    stopPainting: function () {
      this.painting = false;
      this.context.beginPath();
    },

    draw: function (event) {
      if (!this.painting) return;
      const x = event.clientX - this.canvas.getBoundingClientRect().left;
      const y = event.clientY - this.canvas.getBoundingClientRect().top;

      this.context.lineTo(x, y);
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(x, y);
    },

    updateColor: function () {
      this.context.strokeStyle = this.colorPicker.value;
    },

    updateLineWidth: function () {
      this.context.lineWidth = this.lineWidth.value;
    },

    updateOpacity: function () {
      this.context.globalAlpha = this.opacity.value;
    },

    usePresetColor: function () {
      this.colorPicker.value = this.presetColors.value;
      this.updateColor();
    },

    redrawCanvas: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.save();
      this.context.scale(this.zoomLevel, this.zoomLevel);

      // Place your drawing operations here
      // For example, drawing lines or shapes
      this.context.beginPath();
      this.context.moveTo(50, 50);
      this.context.lineTo(150, 150);
      this.context.stroke();

      // End of drawing operations

      this.context.restore();
    },

    handleWheel: function (event) {
      if (event.ctrlKey) {
        event.preventDefault();
        const deltaY = event.deltaY;
        const zoomFactor = deltaY > 0 ? 0.9 : 1.1;

        this.zoomLevel *= zoomFactor;
        this.zoomLevel = Math.max(0.1, Math.min(2, this.zoomLevel)); // Limit zoom range

        this.redrawCanvas();
      }
    }
  };

  Sketch.init();
})(window);
