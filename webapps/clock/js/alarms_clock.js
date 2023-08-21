!(function (exports) {
  'use strict';

  const AlarmsClock = {
    clock: document.getElementById('alarms-clock'),
    analogClock: document.getElementById('alarms-clock-analog'),
    hourHand: document.querySelector('#alarms-clock-analog .analog-hour'),
    minuteHand: document.querySelector('#alarms-clock-analog .analog-minute'),
    secondHand: document.querySelector('#alarms-clock-analog .analog-second'),
    digitalClock: document.getElementById('alarms-clock-digital'),

    init: function () {
      this.updateClock();
      setInterval(() => {
        this.updateClock();
      }, 1000);

      this.clock.addEventListener('click', this.handleClockClick.bind(this));
    },

    updateClock: function () {
      const now = new Date();

      const hours =
        (now.getHours() % 12) + (now.getMinutes() + now.getSeconds() / 60) / 60;
      const minutes = now.getMinutes() + now.getSeconds() / 60;
      const seconds = now.getSeconds();

      const hourRotation = hours * 30 + minutes / 2;
      const minuteRotation = minutes * 6 + seconds / 10;
      const secondRotation = seconds * 6;

      this.hourHand.style.transform = `rotate(${hourRotation}deg)`;
      this.minuteHand.style.transform = `rotate(${minuteRotation}deg)`;
      this.secondHand.style.transform = `rotate(${secondRotation}deg)`;

      const formattedTime = now.toLocaleTimeString('en-US', { hour12: true });
      this.digitalClock.textContent = formattedTime;
    },

    handleClockClick: function () {
      this.clock.classList.toggle('digital');
    }
  };

  // Start the clock
  AlarmsClock.init();
})(window);
