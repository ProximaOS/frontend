const { dialog } = require('electron');
const { BrowserWindow } = require('electron');
const { app } = require('electron');
const update = require('electron-update');

update.on('update-finished', () => {
  var currentWindow = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(currentWindow, {
    title: "Update Sucessful",
    message: "Your browser is now updated to the latest version!\nDo you want to relaunch to see cool new changes?",
    buttons: [
      "Relaunch",
      "Maybe Later"
    ]
  }).then((result) => {
    if (result === 0) {
      app.relaunch();
    }
  });
});
