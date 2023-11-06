!(function (exports) {
  'use strict';

  const LockscreenClock = {
    clockElement: document.getElementById('lockscreen-clock'),

    timeoutID: null,
    is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format

    init: function () {
      this.update();
    },

    update: function () {
      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(this.update.bind(this), 1000);

      if (!LockscreenMotion.motionElement.classList.contains('visible')) {
        return;
      }

      const currentTime = new Date();
      const langCode =
        navigator.mozL10n.language.code === 'ar'
          ? 'ar-SA'
          : navigator.mozL10n.language.code;

      Counter.increment(
        this.clockElement,
        currentTime
          .toLocaleTimeString(langCode, {
            hour12: this.is12HourFormat,
            hour: 'numeric',
            minute: '2-digit'
          })
          .split(' ')[0]
      );
    }
  };

  LockscreenClock.init();
})(window);
