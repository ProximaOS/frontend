const { app } = require('electron');

module.exports = function (mainWindow) {
  let zoom = 1;

  return [
    {
      label: 'File',
      submenu: [
        {
          label: 'Shutdown',
          click: () => {
            app.quit();
          }
        },
        {
          label: 'Restart',
          click: () => {
            app.relaunch();
            app.quit();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Install App',
          click: () => {}
        },
        { type: 'separator' },
        {
          label: 'Open Developer Tools',
          click: () => {
            zoom = 1;
            mainWindow.webContents.openDevTools({ mode: 'detach' });
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Reset Zoom',
          click: () => {
            zoom = 1;
            mainWindow.webContents.setZoomFactor(1);
          }
        },
        {
          label: 'Zoom In',
          click: () => {
            zoom += 0.1;
            mainWindow.webContents.setZoomFactor(zoom);
          }
        },
        {
          label: 'Zoom Out',
          click: () => {
            zoom -= 0.1;
            mainWindow.webContents.setZoomFactor(zoom);
          }
        },
        { type: 'separator' },
        {
          label: 'Rotate To Normal',
          click: () => {
            mainWindow.webContents.send('rotate', { rotation: '0deg' });
          }
        },
        {
          label: 'Rotate Left',
          click: () => {
            mainWindow.webContents.send('rotate', { rotation: '-90deg' });
          }
        },
        {
          label: 'Rotate Right',
          click: () => {
            mainWindow.webContents.send('rotate', { rotation: '90deg' });
          }
        },
        {
          label: 'Rotate Upside Down',
          click: () => {
            mainWindow.webContents.send('rotate', { rotation: '180deg' });
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Orchid Web Docs',
          click: () => {}
        },
        {
          label: 'Help and Support',
          click: () => {}
        },
        { type: 'separator' },
        {
          label: 'Terms Of Service',
          click: () => {}
        },
        {
          label: 'Privacy Policy',
          click: () => {}
        },
        {
          label: 'Community Guidelines',
          click: () => {}
        },
        { type: 'separator' },
        {
          label: 'Check For Updates',
          click: () => {}
        }
      ]
    }
  ];
};
