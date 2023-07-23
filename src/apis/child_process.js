const child_process = require('child_process');

module.exports = {
  exec: function (cli, args = []) {
    const command = `${cli} ${args.join(' ')}`
    child_process.exec(command);
  },

  spawn: function (cli, args = []) {
    const command = `${cli} ${args.join(' ')}`
    child_process.spawn(command);
  }
};
