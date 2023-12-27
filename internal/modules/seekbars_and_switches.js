!(function (exports) {
  'use strict';

  const SeekbarsAndSwitches = {
    inputElements: null,

    activeSwitch: null,
    isSwiping: false,
    startX: 0,
    lastProgress: 0,

    init: function () {
      document.addEventListener('pointermove', this.onPointerMove.bind(this));
      document.addEventListener('pointerup', this.onPointerUp.bind(this));

      this.inputElements = document.querySelectorAll('input');
      this.inputElements.forEach(this.handleEachElement.bind(this));
    },

    handleEachElement: function (inputElement) {
      if (inputElement.type === 'range') {
        inputElement.setAttribute('value', inputElement.value);
        inputElement.addEventListener('input', () => {
          inputElement.setAttribute('value', inputElement.value);
        });
      } else {
        inputElement.addEventListener('pointerdown', (event) => this.onPointerDown(event, inputElement));
        inputElement.addEventListener('input', (event) => this.onInput(inputElement));
        inputElement.addEventListener('change', (event) => this.onInput(inputElement));

        this.onInput(inputElement);
      }
    },

    onPointerDown: function (event, inputElement) {
      this.startX = event.clientX || event.touches[0].clientX;
      this.isSwiping = true;
      if (inputElement !== this.activeSwitch) {
        this.lastProgress = 0;
      }
      this.activeSwitch = inputElement;
    },

    onPointerMove: function (event) {
      if (!this.activeSwitch) {
        return;
      }
      if (!this.isSwiping) {
        return;
      }
      const clientX = event.clientX || event.touches[0].clientX;
      const deltaX = clientX - this.startX;
      const progress = Math.min(Math.max(this.lastProgress + (deltaX / this.activeSwitch.offsetWidth), 0), 1);
      this.activeSwitch.style.setProperty('--switch-movement-progress', progress);
    },

    onPointerUp: function (event) {
      if (!this.activeSwitch) {
        return;
      }
      if (!this.isSwiping) {
        return;
      }
      this.isSwiping = false;

      // Check or uncheck based on swipe direction
      const clientX = event.clientX || event.touches[0].clientX;
      const deltaX = clientX - this.startX;
      if (deltaX > 0) {
        this.activeSwitch.checked = true; // Swiped to the right, check the checkbox
        this.activeSwitch.style.setProperty('--switch-movement-progress', 1);
        this.lastProgress = 1;
      } else if (deltaX < 0) {
        this.activeSwitch.checked = false; // Swiped to the left, uncheck the checkbox
        this.activeSwitch.style.setProperty('--switch-movement-progress', 0);
        this.lastProgress = 0;
      }
    },

    onInput: function (inputElement) {
      if (!this.activeSwitch) {
        return;
      }
      if (inputElement.checked) {
        this.activeSwitch.style.setProperty('--switch-movement-progress', 1);
        this.lastProgress = 1;
      } else {
        this.activeSwitch.style.setProperty('--switch-movement-progress', 0);
        this.lastProgress = 0;
      }
    }
  };

  SeekbarsAndSwitches.init();
})(window);
