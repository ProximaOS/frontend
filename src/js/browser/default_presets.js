!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const isDev = require('electron-is-dev');

  require('dotenv').config();

  let defaultsDir = path.join(process.cwd(), 'defaults');
  if (isDev) {
    defaultsDir = path.join(process.cwd(), 'customization', 'defaults');
  }

  fs.mkdirSync(process.env.OPENORCHID_DATA, { recursive: true });

  fs.readdir(defaultsDir, (error, files) => {
    if (error) {
      return;
    }
    files.forEach((file) => {
      fs.copyFileSync(
        path.join(defaultsDir, file),
        path.join(process.env.OPENORCHID_DATA, file)
      );
    });
  }, { recursive: true });
})();
