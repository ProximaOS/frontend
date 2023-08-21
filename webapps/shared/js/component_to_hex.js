!(function (exports) {

'use strict';

/**
 * Number to Hex converter
 * @param {var} c
 * @returns
 */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

exports.componentToHex = componentToHex;

})(window);
