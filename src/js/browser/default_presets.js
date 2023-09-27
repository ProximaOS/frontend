!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');

  require('dotenv').config();

  let defaultsDir = path.join(process.cwd(), 'defaults');
  if (process.env.NODE_ENV === 'development') {
    defaultsDir = path.join(process.cwd(), 'customize', 'defaults');
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
