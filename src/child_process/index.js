!(function (exports) {
  'use strict';

  const childProcess = require('child_process');

  module.exports = {
    exec: function (cli, args = []) {
      const command = `${cli} ${args.join(' ')}`;
      childProcess.exec(command);
    },

    spawn: function (cli, args = []) {
      const command = `${cli} ${args.join(' ')}`;
      childProcess.spawn(command);
    }
  };
})(window);
