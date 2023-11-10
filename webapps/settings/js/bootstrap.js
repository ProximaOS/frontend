!(function (exports) {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {
    // Initialize
    SpatialNavigation.init();

    // Define navigable elements (anchors and elements with "focusable" class).
    SpatialNavigation.add({
      selector: '.tablist a, .tablist button, .tablist .lists ul li, .visible a, .visible button, .visible .lists ul li, .visible .lists ul li input'
    });

    // Make the *currently existing* navigable elements focusable.
    SpatialNavigation.makeFocusable();

    // Focus the first navigable element.
    SpatialNavigation.focus();
  });
})(window);
