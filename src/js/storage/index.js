!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const mime = require('mime');

  require('dotenv').config();

  const SDCardManager = {
    audioAccess: false,
    booksAccess: false,
    downloadsAccess: false,
    moviesAccess: false,
    musicAccess: false,
    othersAccess: false,
    photosAccess: false,
    homeAccess: false,

    meetsPermissions: function (filePath) {
      if (!SDCardManager.homeAccess) {
        return true;
      }
      if (
        !SDCardManager.audioAccess &&
        (filePath.startsWith('audio') || filePath.startsWith('/audio'))
      ) {
        return true;
      }
      if (
        !SDCardManager.booksAccess &&
        (filePath.startsWith('books') || filePath.startsWith('/books'))
      ) {
        return true;
      }
      if (
        !SDCardManager.downloadsAccess &&
        (filePath.startsWith('downloads') || filePath.startsWith('/downloads'))
      ) {
        return true;
      }
      if (
        !SDCardManager.moviesAccess &&
        (filePath.startsWith('movies') || filePath.startsWith('/movies'))
      ) {
        return true;
      }
      if (
        !SDCardManager.musicAccess &&
        (filePath.startsWith('music') || filePath.startsWith('/music'))
      ) {
        return true;
      }
      if (
        !SDCardManager.othersAccess &&
        (filePath.startsWith('others') || filePath.startsWith('/others'))
      ) {
        return true;
      }
      if (
        !SDCardManager.photosAccess &&
        (filePath.startsWith('photos') || filePath.startsWith('/photos'))
      ) {
        return true;
      }

      return false;
    },
    read: function (filePath, options = { encoding: 'utf8' }) {
      return new Promise((resolve, reject) => {
        if (!SDCardManager.meetsPermissions(filePath)) {
          return;
        }

        fs.readFile(
          path.join(process.env.OPENORCHID_STORAGE, filePath),
          options,
          (error, result) => {
            if (error) {
              reject(error);
              console.log(error);
              return;
            }
            resolve(result);
          }
        );
      });
    },
    write: async (filePath, content) => {
      if (!SDCardManager.meetsPermissions(filePath)) {
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
      if (!SDCardManager.meetsPermissions(filePath)) {
        return;
      }

      const { deleteAsync } = require('del');
      deleteAsync(path.join(process.env.OPENORCHID_STORAGE, input));
    },
    copy: function (fromPath, toPath) {
      if (
        !SDCardManager.meetsPermissions(fromPath) ||
        !SDCardManager.meetsPermissions(toPath)
      ) {
        return;
      }

      copy(
        path.join(process.env.OPENORCHID_STORAGE, fromPath),
        path.join(process.env.OPENORCHID_STORAGE, toPath)
      );
    },
    move: function (fromPath, toPath) {
      if (
        !SDCardManager.meetsPermissions(fromPath) ||
        !SDCardManager.meetsPermissions(toPath)
      ) {
        return;
      }

      mv(
        path.join(process.env.OPENORCHID_STORAGE, fromPath),
        path.join(process.env.OPENORCHID_STORAGE, toPath)
      );
    },
    list: function (dirPath) {
      return new Promise((resolve, reject) => {
        // if (!SDCardManager.meetsPermissions(dirPath)) {
        //   return;
        // }

        fs.readdir(
          path.join(process.env.OPENORCHID_STORAGE, dirPath),
          (error, files) => {
            if (error) {
              reject(error);
              console.log(error);
              return;
            }
            resolve(files);
          }
        );
      });
    },
    getFileStats: function (filePath) {
      return new Promise((resolve, reject) => {
        if (!SDCardManager.meetsPermissions(filePath)) {
          return;
        }

        fs.stat(
          path.join(process.env.OPENORCHID_STORAGE, filePath),
          (error, stats) => {
            if (error) {
              reject(error);
              console.log(error);
            }
            resolve(stats);
          }
        );
      });
    },
    getMime: function (filePath) {
      if (!SDCardManager.meetsPermissions(filePath)) {
        return;
      }

      const mimeType = mime.getType(filePath);
      return mimeType;
    },
    exists: function (filePath) {
      return fs.existsSync(path.join(process.env.OPENORCHID_STORAGE, filePath));
    },
    mkdir: function (path, options = {}) {
      fs.mkdirSync(path.join(process.env.OPENORCHID_STORAGE, path), options);
    }
  };

  module.exports = SDCardManager;
})();
