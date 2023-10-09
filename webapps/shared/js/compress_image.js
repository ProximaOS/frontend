!(function (exports) {
  'use strict';

  function compressImage(base64Data, targetSizeKB, callback) {
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scaleFactor = (targetSizeKB * 1024) / (base64Data.length / 1.37); // Estimate the file size
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 0.7 is the compression quality

      callback(compressedBase64);
    };

    img.src = base64Data;
  }

  exports.compressImage = compressImage;
})(window);
