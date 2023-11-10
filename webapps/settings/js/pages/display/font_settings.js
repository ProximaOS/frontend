!(function (exports) {
  'use strict';

  const FontSettings = {
    previewText: document.getElementById('font-settings-preview-text'),
    weightSlider: document.getElementById('font-settings-weight-slider'),

    init: function () {
      this.weightSlider.min = 1;
      this.weightSlider.max = 1000;
      this.weightSlider.value = 400;
      this.weightSlider.addEventListener('input', this.handleWeightSliderChange.bind(this));
    },

    handleWeightSliderChange: function (event) {
      this.previewText.style.fontVariationSettings = `'wght' ${this.weightSlider.value}`;
    }
  };

  FontSettings.init();
})(window);
