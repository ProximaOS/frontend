const LockscreenDate = {
  dateElement: document.getElementById('lockscreen-date'),
  is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format

  init: function () {
    this.dateElement.classList.remove('hidden');

    this.update();
  },

  update: function () {
    var currentTime = new Date();

    this.dateElement.innerText = currentTime.toLocaleDateString(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    clearTimeout(this.timer);
    this.timer = setTimeout(this.update.bind(this), 1000);
  }
};

LockscreenDate.init();
