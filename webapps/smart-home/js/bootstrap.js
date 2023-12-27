!(function (exports) {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {
    LazyLoader.load([
      'js/webapps.js',
      'js/account.js'
    ]);

    SpatialNavigation.init();
    SpatialNavigation.add({
      selector: 'a, button, ul li, input, .webapp'
    });
    SpatialNavigation.makeFocusable();
    SpatialNavigation.focus();
  });
})(window);
