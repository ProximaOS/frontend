!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const mime = require('mime');
  const permissions = require('../permissions');

  require('dotenv').config();

  const SDCardManager = {
    bufferFrom: Buffer.from,

    setStorageAccess: function (permission, property, value) {
      permissions.checkPermission(permission).then((result) => {
        if (result) {
          SDCardManager[property] = value;
        }
      });
    },

    meetsPermissions: function (filePath) {
      if (!SDCardManager.homeAccess) {
        return true;
      }

      const accessMap = {
        audio: permissions.checkPermission('device-storage:audio'),
        books: permissions.checkPermission('device-storage:books'),
        downloads: permissions.checkPermission('device-storage:downloads'),
        movies: permissions.checkPermission('device-storage:movies'),
        music: permissions.checkPermission('device-storage:music'),
        others: permissions.checkPermission('device-storage:others'),
        photos: permissions.checkPermission('device-storage:photoso')
      };

      for (const category in accessMap) {
        if (!accessMap[category] && (filePath.startsWith(category) || filePath.startsWith(`/${category}`))) {
          return true;
        }
      }

      return false;
    },

    read: function (filePath, options = { encoding: 'utf8' }) {
      return new Promise((resolve, reject) => {
        if (!SDCardManager.meetsPermissions(filePath)) {
          return;
        }

        fs.readFile(path.join(process.env.OPENORCHID_STORAGE, filePath), options, (error, result) => {
          if (error) {
            reject(error);
            console.log(error);
            return;
          }
          resolve(result);
        });
      });
    },

    write: async (filePath, content) => {
      if (!SDCardManager.meetsPermissions(filePath)) {
        return;
      }

      const fileData = await fs.writeFileSync(path.join(process.env.OPENORCHID_STORAGE, filePath), content, 'utf8');
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
      if (!SDCardManager.meetsPermissions(fromPath) || !SDCardManager.meetsPermissions(toPath)) {
        return;
      }

      copy(path.join(process.env.OPENORCHID_STORAGE, fromPath), path.join(process.env.OPENORCHID_STORAGE, toPath));
    },

    move: function (fromPath, toPath) {
      if (!SDCardManager.meetsPermissions(fromPath) || !SDCardManager.meetsPermissions(toPath)) {
        return;
      }

      mv(path.join(process.env.OPENORCHID_STORAGE, fromPath), path.join(process.env.OPENORCHID_STORAGE, toPath));
    },

    list: function (dirPath) {
      return new Promise((resolve, reject) => {
        if (!SDCardManager.meetsPermissions(dirPath)) {
          return;
        }

        fs.readdir(path.join(process.env.OPENORCHID_STORAGE, dirPath), (error, files) => {
          if (error) {
            reject(error);
            console.log(error);
            return;
          }
          resolve(files);
        });
      });
    },

    getStats: function (filePath) {
      if (!SDCardManager.meetsPermissions(filePath)) {
        return;
      }

      let stats = fs.statSync(path.join(process.env.OPENORCHID_STORAGE, filePath));
      stats = Object.assign(stats, {
        is_directory: stats.isDirectory(),
        is_block_device: stats.isBlockDevice(),
        is_char_device: stats.isCharacterDevice(),
        is_symlink: stats.isSymbolicLink(),
        is_socket: stats.isSocket()
      });
      return stats;
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
