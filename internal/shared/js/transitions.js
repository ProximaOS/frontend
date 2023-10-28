!(function (exports) {
  'use strict';

  const Transitions = {
    scale: function (from, to) {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();

      const fromX = fromRect.left - toRect.left;
      const fromY = fromRect.top - toRect.top;
      const fromWidth = fromRect.width / toRect.width;
      const fromHeight = fromRect.height / toRect.height;

      const toX = toRect.left - fromRect.left;
      const toY = toRect.top - fromRect.top;
      const toWidth = toRect.width / fromRect.width;
      const toHeight = toRect.height / fromRect.height;

      from.style.setProperty('--pos-x', `${toX}px`);
      from.style.setProperty('--pos-y', `${toY}px`);
      from.style.setProperty('--scale-x', toWidth);
      from.style.setProperty('--scale-y', toHeight);
      from.classList.add('from-scale');
      from.addEventListener('animationend', () => {
        from.classList.remove('from-scale');
      });

      to.style.setProperty('--pos-x', `${fromX}px`);
      to.style.setProperty('--pos-y', `${fromY}px`);
      to.style.setProperty('--scale-x', fromWidth);
      to.style.setProperty('--scale-y', fromHeight);
      to.classList.add('to-scale');
      to.addEventListener('animationend', () => {
        to.classList.remove('to-scale');
      });
    }
  };

  exports.Transitions = Transitions;
})(window);
