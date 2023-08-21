!(function (exports) {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const mime = require('mime');

  require('dotenv').config();

  module.exports = {
    read: (filePath, options = { encoding: 'utf8' }) => {
      return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(
          path.join(process.env.OPENORCHID_STORAGE, filePath),
          options
        );
        fileData.then((result) => {
          resolve(result);
        })
      });
    },
    write: async (filePath, content) => {
      const fileData = await fs.writeFileSync(
        path.join(process.env.OPENORCHID_STORAGE, filePath),
        content,
        'utf8'
      );
      console.log('File content:', fileData);
    },
    delete: (input) => {
      const { deleteAsync } = require('del');
      deleteAsync(path.join(process.env.OPENORCHID_STORAGE, input));
    },
    copy: (fromPath, toPath) => {
      copy(
        path.join(process.env.OPENORCHID_STORAGE, fromPath),
        path.join(process.env.OPENORCHID_STORAGE, toPath)
      );
    },
    move: (fromPath, toPath) => {
      mv(
        path.join(process.env.OPENORCHID_STORAGE, fromPath),
        path.join(process.env.OPENORCHID_STORAGE, toPath)
      );
    },
    list: (dirPath) => {
      return new Promise((resolve, reject) => {
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
    getFileStats: (filePath) => {
      return new Promise((resolve, reject) => {
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
    getMime: (filePath) => {
      return new Promise((resolve, reject) => {
        const mimeType = mime.getType(filePath);
        resolve(mimeType);
      });
    }
  };
})(window);
