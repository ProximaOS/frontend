const fs = require('fs');
const path = require('path');
const permissions = require('../permissions');

require('dotenv').config();

module.exports = {
  read: (filePath) => {
    return new Promise((resolve, reject) => {
      permissions.requestPermission('storage');
      permissions.permissionListener('storage', async (data) => {
        const fileData = await fs.readFileSync(path.join(process.env.OPENORCHID_STORAGE, filePath), 'utf8');
        resolve(fileData);
      });
    });
  },
  write: (filePath, content) => {
    permissions.requestPermission('storage');
    permissions.permissionListener('storage', async (data) => {
      const fileData = await fs.writeFileSync(path.join(process.env.OPENORCHID_STORAGE, filePath), content, 'utf8');
      console.log('File content:', fileData);
    });
  },
  delete: (input) => {
    permissions.requestPermission('storage');
    permissions.permissionListener('storage', (data) => {
      const { deleteAsync } = require('del');
      deleteAsync(path.join(process.env.OPENORCHID_STORAGE, input));
    });
  },
  copy: (fromPath, toPath) => {
    permissions.requestPermission('storage');
    permissions.permissionListener('storage', (data) => {
      copy(path.join(process.env.OPENORCHID_STORAGE, fromPath), path.join(process.env.OPENORCHID_STORAGE, toPath));
    });
  },
  move: (fromPath, toPath) => {
    permissions.requestPermission('storage');
    permissions.permissionListener('storage', (data) => {
      mv(path.join(process.env.OPENORCHID_STORAGE, fromPath), path.join(process.env.OPENORCHID_STORAGE, toPath));
    });
  },
  list: (dirPath) => {
    return new Promise((resolve, reject) => {
      permissions.requestPermission('storage');
      permissions.permissionListener('storage', (data) => {
        fs.readdir(path.join(process.env.OPENORCHID_STORAGE, dirPath), (error, stats) => {
          if (error) {
            console.log(error);
          }
          resolve(stats);
        });
      });
    });
  },
  getFileStats: (filePath) => {
    return new Promise((resolve, reject) => {
      permissions.requestPermission('storage');
      permissions.permissionListener('storage', (data) => {
        fs.stat(path.join(process.env.OPENORCHID_STORAGE, filePath), (error, stats) => {
          if (error) {
            console.log(error);
          }
          resolve(stats);
        });
      });
    });
  },
  getMime: (filePath) => {
    return new Promise((resolve, reject) => {
      permissions.requestPermission('storage');
      permissions.permissionListener('storage', (data) => {
        var mime = mime.getType(path.join(process.env.OPENORCHID_STORAGE, filePath));
        resolve(mime);
      });
    });
  },
};
