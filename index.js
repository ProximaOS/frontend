const { app, autoUpdater, BrowserWindow, dialog } = require("electron");
const path = require("path");
const chrome = require("./src/chrome");
const runtime = require("./src/runtime/app_runtime");
const openOrchid = require("./src/openorchid");
const protocols = require("electron-protocols");

app.allowRendererProcessReuse = true;

// Disable error dialogs by overriding
dialog.showErrorBox = function(title, content) {
  console.log(`${title}\n${content}`);
};

protocols.register("openorchid", (uri) => {
  if (uri.pathname) {
    return path.join(__dirname, "internal", uri.host, uri.pathname);
  }
  return path.join(__dirname, "internal", uri.host);
});

// When the app is ready, create the main window
app.on('ready', function () {
  process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    // Handle the error as needed
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    // Handle the rejection as needed
  });

  const updateWindow = new BrowserWindow({
    icon: path.join(__dirname, "..", "icons", "icon.png"),
    title: "OpenOrchid Updater",
    width: 320,
    height: 256,
    show: false,
    frame: false,
    thickFrame: true,
    webPreferences: {
      defaultFontFamily: "system-ui",
      defaultMonospaceFontSize: 14,
      disableDialogs: true,
      devTools: require("electron-is-dev"),
      preload: path.join(__dirname, 'src', 'update.js')
    },
  });
  updateWindow.loadURL("openorchid://updater/index.html");

  autoUpdater.setFeedURL("https://www.example.com/updates/");
  autoUpdater.addListener("checking-for-update", () => {
    updateWindow.show();
  });
  autoUpdater.addListener("update-not-available", () => {
    updateWindow.hide();
  });
  // autoUpdater.checkForUpdates();

  if (process.argv.indexOf("--chrome") !== -1) {
    chrome();
  } else {
    runtime();
    openOrchid();
  }
});

// Quit the app when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

require('electron-reload')(__dirname, {
  hardResetMethod: 'exit'
});
