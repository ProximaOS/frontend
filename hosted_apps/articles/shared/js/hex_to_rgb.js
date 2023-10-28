!(function (exports) {

'use strict';

/**
 * Hex to RGB color converter
 * @param {string} color
 * @returns {string}
 */
function hexToRgb(color) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (result) {
    return 'rgb(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ')';
  } else {
    return null;
  }
}

/**
 * Hex to RGB color converter that returns each RGB value seperatedly
 * @param {string} color
 * @returns {string}
 */
function hexToRgbValues(color) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  } else {
    return null;
  }
}

exports.hexToRgb = hexToRgb;
exports.hexToRgbValues = hexToRgbValues;

})(window);
