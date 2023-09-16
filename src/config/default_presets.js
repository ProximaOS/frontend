!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');

  require('dotenv').config();

  fs.mkdirSync(process.env.OPENORCHID_DATA, { recursive: true });

  fs.readdir(path.join(process.cwd(), 'defaults'), (error, files) => {
    if (error) {
      return;
    }
    files.forEach((file) => {
      fs.copyFileSync(
        path.join(process.cwd(), 'defaults', file),
        path.join(process.env.OPENORCHID_DATA, file)
      );
    });
  }, { recursive: true });
})();
