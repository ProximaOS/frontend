const { app, BrowserWindow, ipcMain, Notification, session } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

function createWindow() {
  const mainWindow = new BrowserWindow({
    icon: './res/default.png',
    title: 'OpenOrchid Simulator (Vulkan)',
    width: 320,
    height: 640,
    autoHideMenuBar: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      webviewTag: true,
      contextIsolation: false,
      scrollBounce: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('http://system.localhost:8081/index.html', {
    userAgent: 'Mozilla/5.0 (Linux; OpenOrchid 1.0.0; rv:114.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Mobile Safari/537.36 OpenOrchid/1.0.0'
  });

  const webAppsDir = './webapps';
  const files = fs.readdirSync(webAppsDir);

  files.forEach((dir) => {
    const localServer = http.createServer((req, res) => {
      // Extract the subdomain from the host header
      const host = req.headers.host || '';
      const subdomain = host.split('.')[0];

      const filePath = path.join(webAppsDir, subdomain, req.url);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
          return;
        }

        // Disable CORS by setting appropriate response headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        res.writeHead(200);
        res.end(data);
      });
    });

    const subdomain = dir.split('.')[0];
    localServer.listen(8081, 'localhost', () => {
      console.log(`Server for subdomain ${subdomain} running at http://${subdomain}.localhost:8081`);
    });
  });

  // Notification event
  ipcMain.on('trigger-notification', (event, notificationData) => {
    const { title, body } = notificationData;
    const notification = new Notification({
      title: title,
      body: body
    });

    notification.show();

    // Pass the notification event with data to the renderer process
    mainWindow.webContents.send('notification', { event, notificationData });
  });

  // Open event
  ipcMain.on('open-url', (event, url) => {
    // Pass the open event with URL to the renderer process
    mainWindow.webContents.send('open-url', { event, url });
  });

  // Permission request event
  ipcMain.on('request-permissions', (event, permissionData) => {
    // Handle the permission request
    // ...

    // Pass the permission request event with data to the renderer process
    mainWindow.webContents.send('permissionrequest', { event, permissionData });
  });
}

app.whenReady().then(createWindow);
