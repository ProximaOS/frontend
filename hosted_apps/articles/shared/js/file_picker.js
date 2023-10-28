!(function (exports) {
  'use strict';

  function FilePicker(acceptedFileTypes, callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedFileTypes.join(',');

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function () {
        const base64Data = reader.result;
        callback(base64Data);
      };

      reader.readAsDataURL(file);
    });

    input.click();
  }

  exports.FilePicker = FilePicker;
})(window);
