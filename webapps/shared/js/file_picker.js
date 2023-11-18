!(function (exports) {
  'use strict';

  function FilePicker(acceptedFileTypes, callback, encoding = 'unit8array') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedFileTypes.join(',');

    input.addEventListener('change', (event) => {
      if (encoding === 'base64') {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function () {
          const base64Data = reader.result;
          callback(base64Data, file.type);
        };

        reader.readAsDataURL(file);
      } else {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
          const arrayBuffer = event.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          callback(uint8Array, file.type);
        };

        reader.readAsArrayBuffer(file);
      }
    });

    input.click();
  }

  exports.FilePicker = FilePicker;
})(window);
