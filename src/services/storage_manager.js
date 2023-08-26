!(function (exports) {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const mime = require('mime');

  require('dotenv').config();

  module.exports = {
    audioAccess: false,
    booksAccess: false,
    downloadsAccess: false,
    moviesAccess: false,
    musicAccess: false,
    othersAccess: false,
    photosAccess: false,
    homeAccess: false,

    meetsPermissions: function (filePath) {
      filePath = filePath.toString();

      if (!this.homeAccess) {
        return true;
      }
      if (
        !this.audioAccess &&
        (filePath.startWith('audio') || filePath.startWith('/audio'))
      ) {
        return true;
      }
      if (
        !this.booksAccess &&
        (filePath.startWith('books') || filePath.startWith('/books'))
      ) {
        return true;
      }
      if (
        !this.downloadsAccess &&
        (filePath.startWith('downloads') || filePath.startWith('/downloads'))
      ) {
        return true;
      }
      if (
        !this.moviesAccess &&
        (filePath.startWith('movies') || filePath.startWith('/movies'))
      ) {
        return true;
      }
      if (
        !this.musicAccess &&
        (filePath.startWith('music') || filePath.startWith('/music'))
      ) {
        return true;
      }
      if (
        !this.othersAccess &&
        (filePath.startWith('others') || filePath.startWith('/others'))
      ) {
        return true;
      }
      if (
        !this.photosAccess &&
        (filePath.startWith('photos') || filePath.startWith('/photos'))
      ) {
        return true;
      }

      return false;
    },

    read: function (filePath, options = { encoding: 'utf8' }) {
      return new Promise((resolve, reject) => {
        if (!this.meetsPermissions(filePath)) {
          return;
        }

        const fileData = fs.readFileSync(
          path.join(process.env.OPENORCHID_STORAGE, filePath),
          options
        );
        fileData.then((result) => {
          resolve(result);
        });
      });
    },
    write: async (filePath, content) => {
      if (!this.meetsPermissions(filePath)) {
        return;
      }

      const fileData = await fs.writeFileSync(
        path.join(process.env.OPENORCHID_STORAGE, filePath),
        content,
        'utf8'
      );
      console.log('File content:', fileData);
    },
    delete: function (filePath) {
      if (!this.meetsPermissions(filePath)) {
        return;
      }

      const { deleteAsync } = require('del');
      deleteAsync(path.join(process.env.OPENORCHID_STORAGE, input));
    },
    copy: function (fromPath, toPath) {
      if (!this.meetsPermissions(fromPath) || !this.meetsPermissions(toPath)) {
        return;
      }

      copy(
        path.join(process.env.OPENORCHID_STORAGE, fromPath),
        path.join(process.env.OPENORCHID_STORAGE, toPath)
      );
    },
    move: function (fromPath, toPath) {
      if (!this.meetsPermissions(fromPath) || !this.meetsPermissions(toPath)) {
        return;
      }

      mv(
        path.join(process.env.OPENORCHID_STORAGE, fromPath),
        path.join(process.env.OPENORCHID_STORAGE, toPath)
      );
    },
    list: function (dirPath) {
      return new Promise((resolve, reject) => {
        if (!this.meetsPermissions(dirPath)) {
          return;
        }

        fs.readdir(
          path.join(process.env.OPENORCHID_STORAGE, dirPath),
          (error, stats) => {
            if (error) {
              console.log(error);
            }
            resolve(stats);
          }
        );
      });
    },
    getFileStats: function (filePath) {
      return new Promise((resolve, reject) => {
        if (!this.meetsPermissions(filePath)) {
          return;
        }

        fs.stat(
          path.join(process.env.OPENORCHID_STORAGE, filePath),
          (error, stats) => {
            if (error) {
              console.log(error);
            }
            resolve(stats);
          }
        );
      });
    },
    getMime: function (filePath) {
      return new Promise((resolve, reject) => {
        if (!this.meetsPermissions(filePath)) {
          return;
        }

        const mimeType = mime.getType(filePath);
        resolve(mimeType);
      });
    }
  };
})(window);
