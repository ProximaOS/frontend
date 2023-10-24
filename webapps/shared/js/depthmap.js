!(function (exports) {
  'use strict';

  function DepthMap (imageUrl, callback) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;

    image.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const grayscaleValue =
          (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) /
          3;
        const depthValue = grayscaleValue;

        imageData.data[i] =
          imageData.data[i + 1] =
          imageData.data[i + 2] =
            depthValue;
      }

      ctx.putImageData(imageData, 0, 0);
      callback(ctx.getImageData());
    };
  }

  exports.DepthMap = DepthMap;
})(window);
