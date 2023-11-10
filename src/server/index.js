!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const http = require('http');
  const AdmZip = require('adm-zip');
  const express = require('express');
  const mime = require('mime');

  const WifiManager = require('../wifi');
  const BluetoothManager = require('../bluetooth');
  const StorageManager = require('../storage');
  const TimeManager = require('../time');
  const Settings = require('../settings');
  const AppsManager = require('../webapps');
  const ChildProcess = require('../child_process');
  const VirtualManager = require('../virtualization');
  const PowerManager = require('../power');
  const RtlsdrReciever = require('../rtlsdr');
  const UsersManager = require('../users');
  const TelephonyManager = require('../telephony');
  const SmsManager = require('../sms');
  const DeviceInformation = require('../device/device_info');

  const expressServer = express();

  require('dotenv').config();

  module.exports = function (app) {
    const webAppsDir = process.env.OPENORCHID_WEBAPPS;
    const internalDir = `${__dirname}/../../../internal`;
    const files = fs.readdirSync(webAppsDir);

    files.forEach((dir) => {
      const subdomain = dir.split('.')[0];

      const localServer = http.createServer((req, res) => {
        // Check if the request is meant for the Express app
        if (req.url.startsWith('/api/data')) {
          expressServer(req, res);
        } else if (req.url.startsWith('/api/services')) {
          // ...
        } else {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          const host = req.headers.host || '';
          const subdomain = host.split('.')[0];

          function sendRequest(data, contentType) {
            res.setHeader('Content-Type', contentType); // Set the content type header
            res.writeHead(200);
            res.end(data);
          }

          let filePath;
          if (!subdomain) {
            filePath = path.join(internalDir, req.url);

            fs.readFile(filePath, (err, data) => {
              if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
              }
              const contentType = mime.getType(path.extname(filePath));
              sendRequest(data, contentType); // Pass the content type to sendRequest
            });

            return;
          }

          if (process.env.NODE_ENV === 'production') {
            const zipFilePath = path.join(webAppsDir, subdomain, 'webapp.zip');
            const zip = new AdmZip(zipFilePath);

            const requestPath = req.url === '/' ? '/index.html' : req.url;
            const zipEntry = zip.getEntry(requestPath.substring(1)); // Use the correct request path

            if (!zipEntry) {
              res.writeHead(404);
              res.end('File not found');
              return;
            }

            const data = zipEntry.getData();
            const contentType = mime.getType(path.extname(zipEntry.entryName));
            sendRequest(data, contentType); // Pass the content type to sendRequest
          } else {
            filePath = path.join(webAppsDir, subdomain, req.url);

            fs.readFile(filePath, (err, data) => {
              if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
              }
              const contentType = mime.getType(path.extname(filePath));
              sendRequest(data, contentType); // Pass the content type to sendRequest
            });
          }
        }
      });

      localServer.listen(8081, 'localhost', () => {
        console.log(`Server for subdomain ${subdomain} running at http://${subdomain}.localhost:8081`);
      });

      app.on('will-quit', () => {
        localServer.close(() => {
          console.log(`Ending webapp runtime server for ${subdomain}...`);
        });
      });
    });
  };

  // Bluetooth
  expressServer.get('/api/data/bluetooth/enable', (req, res) => {
    BluetoothManager.enable();
  });
  expressServer.get('/api/data/bluetooth/disable', (req, res) => {
    BluetoothManager.disable();
  });
  expressServer.get('/api/data/bluetooth/scan', async (req, res) => {
    res.send(await BluetoothManager.scan(req.query.duration));
  });
  expressServer.get('/api/data/bluetooth/connect', (req, res) => {
    BluetoothManager.connect(req.query.id);
  });
  expressServer.get('/api/data/bluetooth/disconnect', (req, res) => {
    BluetoothManager.disconnect(req.query.id);
  });

  // Child Process
  expressServer.get('/api/data/child_process/exec', (req, res) => {
    ChildProcess.exec(req.query.cli, req.query.args);
  });
  expressServer.get('/api/data/child_process/spawn', (req, res) => {
    ChildProcess.spawn(req.query.cli, req.query.args);
  });

  // Device Information
  expressServer.get('/api/data/device_info/hwid', (req, res) => {
    res.send(DeviceInformation.getHardwareId());
  });
  expressServer.get('/api/data/device_info/cpus', (req, res) => {
    res.send(JSON.stringify(os.cpus()));
  });
  expressServer.get('/api/data/device_info/platform', (req, res) => {
    res.send(os.platform());
  });
  expressServer.get('/api/data/device_info/name', (req, res) => {
    res.send(os.version());
  });
  expressServer.get('/api/data/device_info/arch', (req, res) => {
    res.send(os.machine());
  });
  expressServer.get('/api/data/device_info/endianness', (req, res) => {
    res.send(os.endianness());
  });
  expressServer.get('/api/data/device_info/hostname', (req, res) => {
    res.send(os.hostname());
  });
  expressServer.get('/api/data/device_info/freemem', (req, res) => {
    res.send(os.freemem());
  });
  expressServer.get('/api/data/device_info/totalmem', (req, res) => {
    res.send(os.totalmem());
  });
  expressServer.get('/api/data/device_info/uptime', (req, res) => {
    res.send(os.uptime());
  });
  expressServer.get('/api/data/device_info/homedir', (req, res) => {
    res.send(os.homedir());
  });
  expressServer.get('/api/data/device_info/tempdir', (req, res) => {
    res.send(os.tempdir());
  });

  // Power
  expressServer.get('/api/data/power/shutdown', (req, res) => {
    PowerManager.shutdown();
  });
  expressServer.get('/api/data/power/restart', (req, res) => {
    PowerManager.restart();
  });
  expressServer.get('/api/data/power/sleep', (req, res) => {
    PowerManager.sleep();
  });

  // Settings
  expressServer.get('/api/data/settings/get', async (req, res) => {
    res.send(await Settings.getValue(req.query.name));
  });
  expressServer.get('/api/data/settings/set', (req, res) => {
    Settings.setValue(req.query.name, req.query.value);
  });
  expressServer.get('/api/data/settings/observe', (req, res) => {
    Settings.addObserver(req.query.name, (data) => {
      res.send(JSON.stringify(data));
    });
  });

  // Storage
  expressServer.get('/api/data/storage/read', async (req, res) => {
    res.send(await StorageManager.read(req.query.path));
  });
  expressServer.get('/api/data/storage/write', (req, res) => {
    StorageManager.write(req.query.path, req.query.data);
  });
  expressServer.get('/api/data/storage/list', async (req, res) => {
    res.send(await StorageManager.list(req.query.path));
  });
  expressServer.get('/api/data/storage/delete', (req, res) => {
    StorageManager.delete(req.query.path);
  });
  expressServer.get('/api/data/storage/copy', (req, res) => {
    StorageManager.copy(req.query.path);
  });
  expressServer.get('/api/data/storage/move', (req, res) => {
    StorageManager.move(req.query.path);
  });
  expressServer.get('/api/data/storage/stats', async (req, res) => {
    res.send(await StorageManager.getFileStats(req.query.path));
  });
  expressServer.get('/api/data/storage/mime', (req, res) => {
    res.send(StorageManager.getMime(req.query.path));
  });

  // Webapps
  expressServer.get('/api/data/webapps/getall', async (req, res) => {
    res.send(await AppsManager.getAll());
  });
  expressServer.get('/api/data/webapps/install', (req, res) => {
    AppsManager.installPackage(req.query.path);
  });
  expressServer.get('/api/data/webapps/uninstall', (req, res) => {
    AppsManager.uninstall(req.query.id);
  });

  // Wifi
  expressServer.get('/api/data/wifi/enable', (req, res) => {
    WifiManager.enable();
  });
  expressServer.get('/api/data/wifi/disable', (req, res) => {
    WifiManager.disable();
  });
  expressServer.get('/api/data/wifi/scan', async (req, res) => {
    res.json(await WifiManager.scan(req.query.duration));
  });
  expressServer.get('/api/data/wifi/current_connections', async (req, res) => {
    res.json(await WifiManager.getCurrentConnections(req.query.id));
  });
  expressServer.get('/api/data/wifi/delete', (req, res) => {
    WifiManager.delete(req.query.ssid);
  });
})();
