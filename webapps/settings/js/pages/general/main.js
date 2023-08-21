!(function (exports) {
  'use strict';

  const General = {
    softwareButtonsCheckbox: document.getElementById(
      'general-softwareButtons-checkbox'
    ),

    init: function () {
      // Add event listener to the Wi-Fi checkbox
      this.softwareButtonsCheckbox.addEventListener(
        'change',
        this.handleSoftwareButtonsCheckbox.bind(this)
      );

      _session.settings
        .getValue('general.software_buttons.enabled')
        .then((value) => {
          this.softwareButtonsCheckbox.checked = value;
        });
    },

    handleSoftwareButtonsCheckbox: function () {
      _session.settings.setValue(
        'general.software_buttons.enabled',
        this.softwareButtonsCheckbox.checked
      );
    }
  };

  General.init();
})(window);
