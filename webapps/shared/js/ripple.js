!(function (exports) {
  'use strict';

  const RippleEffect = {
    elements: [],
    timeoutID: null,

    init: function () {
      this.addRippleEffect('[role="panel"] > header:first-child a, .lists ul li, .bb-tablist ul li, .bb-toolbar button');
    },

    addRippleEffect: function (selector) {
      const selectedElements = document.querySelectorAll(selector);
      this.elements.push(...selectedElements);
      this.attachRippleEffect();
    },

    attachRippleEffect: function () {
      this.elements.forEach(element => {
        element.addEventListener('mousedown', this.createRipple.bind(this, element));
        element.addEventListener('touchdown', this.createRipple.bind(this, element));
      });
    },

    createRipple: function (element, event) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const diameter = Math.max(element.clientWidth, element.clientHeight);
      const radius = diameter / 2;

      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.top = `${event.clientY - element.getBoundingClientRect().top - radius}px`;
      ripple.style.left = `${event.clientX - element.getBoundingClientRect().left - radius}px`;

      element.appendChild(ripple);
      this.timeoutID = setTimeout(() => {
        ripple.remove();
      }, 1500);
    }
  };

  RippleEffect.init();

  exports.RippleEffect = RippleEffect;
})(window);
