const LockscreenClock = {
  clockElement: document.getElementById('lockscreen-clock'),
  is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format

  init: function () {
    this.clockElement.classList.remove('hidden');

    this.update();
  },

  update: function () {
    var currentTime = new Date();

    this.clockElement.innerText = currentTime.toLocaleTimeString(navigator.language, {
      hour12: this.is12HourFormat,
      hour: 'numeric',
      minute: '2-digit'
    });

    clearTimeout(this.timer);
    this.timer = setTimeout(this.update.bind(this), 1000);
  }
};

LockscreenClock.init();
