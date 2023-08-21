!(function (exports) {

'use strict';

const UtilityTrayMotion = {
  statusbar: document.getElementById('statusbar'),
  motionElement: document.getElementById('utility-tray-motion'),

  init: function() {
    this.statusbar.addEventListener('click', this.onClick.bind(this));
  },

  onClick: function() {
    this.motionElement.classList.toggle('visible');
  },

  hideMotionElement: function() {
    this.motionElement.classList.remove('visible');
  },

  showMotionElement: function() {
    this.motionElement.classList.add('visible');
  }
};

UtilityTrayMotion.init();

})(window);
