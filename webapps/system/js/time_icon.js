!(function (exports) {
  'use strict';

  const TimeIcon = {
    iconElement: document.getElementById('statusbar-time'),
    dateElement: document.getElementById('statusbar-date'),
    is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format

    init: function () {
      this.iconElement.classList.remove('hidden');

      this.update();
    },

    update: function () {
      const currentTime = new Date();
      const langCode =
        navigator.mozL10n.language.code === 'ar'
          ? 'ar-SA'
          : navigator.mozL10n.language.code;

      this.iconElement.innerText = currentTime
        .toLocaleTimeString(langCode, {
          hour12: this.is12HourFormat,
          hour: 'numeric',
          minute: '2-digit'
        })
        .split(' ')[0];

      this.dateElement.innerText = currentTime
        .toLocaleDateString(langCode, {
          day: 'numeric',
          month: 'short'
        });

      clearTimeout(this.timer);
      this.timer = setTimeout(this.update.bind(this), 1000);
    }
  };

  TimeIcon.init();

  exports.TimeIcon = TimeIcon;
})(window);
