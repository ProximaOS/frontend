!(function () {
  'use strict';

  module.exports = {
    addUser: (username, callback) => {
      exec(`sudo useradd ${username}`, (error, stdout, stderr) => {
        if (error) {
          callback(error.message);
        } else {
          callback(null, `User ${username} added successfully.`);
        }
      });
    },

    deleteUser: (username, callback) => {
      exec(`sudo userdel ${username}`, (error, stdout, stderr) => {
        if (error) {
          callback(error.message);
        } else {
          callback(null, `User ${username} deleted successfully.`);
        }
      });
    },

    modifyUser: (username, options, callback) => {
      const optionsString = Object.entries(options)
        .map(([key, value]) => `--${key} ${value}`)
        .join(' ');

      exec(
        `sudo usermod ${optionsString} ${username}`,
        (error, stdout, stderr) => {
          if (error) {
            callback(error.message);
          } else {
            callback(null, `User ${username} modified successfully.`);
          }
        }
      );
    },

    listUsers: (callback) => {
      exec('cat /etc/passwd | cut -d: -f1', (error, stdout, stderr) => {
        if (error) {
          callback(error.message);
        } else {
          const users = stdout.trim().split('\n');
          callback(null, users);
        }
      });
    }
  };
})();
