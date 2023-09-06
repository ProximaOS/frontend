!(function (exports) {
  'use strict';

  const LockscreenPIN = {
    lockscreen: document.getElementById('lockscreen'),
    element: document.getElementById('lockscreen-pin'),
    pinInput: document.getElementById('lockscreen-pin-input'),
    keypadButtons: document.querySelectorAll('#lockscreen-pin-keypad button'),
    backspaceButton: document.getElementById('lockscreen-pin-backspace'),
    emergencyButton: document.getElementById('lockscreen-pin-emergency'),

    password: '1234',

    init: function () {
      this.keypadButtons.forEach(button => {
        button.addEventListener('click', this.handleButtonClick.bind(this));
      });
    },

    handleButtonClick: function (event) {
      event.preventDefault();
      const buttonValue = event.target.dataset.value;

      if (buttonValue === '0' || (buttonValue >= '1' && buttonValue <= '9')) {
        // Append the clicked button value to the PIN input
        this.pinInput.value += buttonValue;
        if (this.pinInput.value === this.password) {
          LockscreenMotion.hideMotionElement();
          LockscreenMotion.isDragging = false;
          this.pinInput.value = '';
        }
      } else if (buttonValue === 'backspace') {
        // Remove the last character from the PIN input
        if (this.pinInput.value === '') {
          this.lockscreen.classList.remove('pin-lock-visible');
        } else {
          this.pinInput.value = this.pinInput.value.slice(0, -1);
          if (this.pinInput.value === '') {
            this.backspaceButton.children[0].dataset.icon = 'back';
          } else {
            this.backspaceButton.children[0].dataset.icon = 'keypad-delete';
          }
        }
      } else if (buttonValue === 'emergency') {
        // TODO: Handle SOS button click
        alert('Emergency SOS button clicked');
      }
    }
  };

  LockscreenPIN.init();
})(window);
