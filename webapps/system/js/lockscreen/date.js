!(function (exports) {
  'use strict';

  const LockscreenDate = {
    dateElement: document.getElementById('lockscreen-date'),
    is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format
    timeoutID: null,

    init: function () {
      this.dateElement.classList.remove('hidden');

      this.update();
    },

    update: function () {
      const currentTime = new Date();
      const langCode =
        L10n.currentLanguage.startsWith('ar')
          ? 'ar-SA'
          : L10n.currentLanguage;

      this.dateElement.innerText = currentTime.toLocaleDateString(langCode, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      clearTimeout(this.timer);
      this.timeoutID = setTimeout(this.update.bind(this), 1000);
    }
  };

  LockscreenDate.init();
})(window);
