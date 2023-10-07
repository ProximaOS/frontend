!(function (exports) {
  'use strict';

  const Accessibility = {
    narratorSwitch: document.getElementById('accessibility-narrator-switch'),

    init: function () {
      this.narratorSwitch.addEventListener('change', this.handleNarratorSwitch.bind(this));
      Settings.getValue('accessibility.narrator.enabled').then((data) => {
        this.narratorSwitch.checked = data;
      });
    },

    handleNarratorSwitch: function () {
      const value = this.narratorSwitch.checked;
      Settings.setValue('accessibility.narrator.enabled', value);
    }
  };

  Accessibility.init();
})(window);
