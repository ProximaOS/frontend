!(function (exports) {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {
    // Initialize
    SpatialNavigation.init();

    // Define navigable elements (anchors and elements with "focusable" class).
    SpatialNavigation.add({
      selector: 'a, button, ul li, input'
    });

    // Make the *currently existing* navigable elements focusable.
    SpatialNavigation.makeFocusable();

    // Focus the first navigable element.
    SpatialNavigation.focus();
  });
})(window);
