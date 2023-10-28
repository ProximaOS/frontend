!(function (exports) {
  'use strict';

  function MediaMetadata (filePath) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const dv = new DataView(this.result);

        if (dv.getString(3, dv.byteLength - 128) === 'TAG') {
          const title = dv.getString(30, dv.tell());
          const artist = dv.getString(30, dv.tell());
          const album = dv.getString(30, dv.tell());
          const year = dv.getString(4, dv.tell());

          resolve({ title, artist, album, year });
        } else {
          reject(new Error('No ID3v1 data found.'));
        }
      };

      reader.readAsDataURL(filePath);
    });
  }

  exports.MediaMetadata = MediaMetadata;
})(window);
