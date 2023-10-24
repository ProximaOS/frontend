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

  const app = express();

  require('dotenv').config();

  module.exports = function (app) {
    const webAppsDir = process.env.OPENORCHID_WEBAPPS;
    const internalDir = `${__dirname}/../../../internal`;
    const files = fs.readdirSync(webAppsDir);

    files.forEach((dir) => {
      const subdomain = dir.split('.')[0];

      const localServer = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        const host = req.headers.host || '';
        const subdomain = host.split('.')[0];

        function sendRequest (data, contentType) {
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
      });

      localServer.listen(8081, 'localhost', () => {
        console.log(
          `Server for subdomain ${subdomain} running at http://${subdomain}.localhost:8081`
        );
      });

      app.on('will-quit', () => {
        console.log('Closing...');
        localServer.close(() => {
          console.log('Ending webapp runtime server...');
        });
      });
    });
  };

  // Bluetooth
  app.get('/bluetooth/enable', (req, res) => {
    BluetoothManager.enable();
  });
  app.get('/bluetooth/disable', (req, res) => {
    BluetoothManager.disable();
  });
  app.get('/bluetooth/scan', async (req, res) => {
    res.send(await BluetoothManager.scan(req.query.duration));
  });
  app.get('/bluetooth/connect', (req, res) => {
    BluetoothManager.connect(req.query.id);
  });
  app.get('/bluetooth/disconnect', (req, res) => {
    BluetoothManager.disconnect(req.query.id);
  });

  // Child Process
  app.get('/child_process/exec', (req, res) => {
    ChildProcess.exec(req.query.cli, req.query.args);
  });
  app.get('/child_process/spawn', (req, res) => {
    ChildProcess.spawn(req.query.cli, req.query.args);
  });

  // Device Information
  app.get('/device_info/hwid', (req, res) => {
    res.send(DeviceInformation.getHardwareId());
  });
  app.get('/device_info/cpus', (req, res) => {
    res.send(JSON.stringify(os.cpus()));
  });
  app.get('/device_info/platform', (req, res) => {
    res.send(os.platform());
  });
  app.get('/device_info/name', (req, res) => {
    res.send(os.version());
  });
  app.get('/device_info/arch', (req, res) => {
    res.send(os.machine());
  });
  app.get('/device_info/endianness', (req, res) => {
    res.send(os.endianness());
  });
  app.get('/device_info/hostname', (req, res) => {
    res.send(os.hostname());
  });
  app.get('/device_info/freemem', (req, res) => {
    res.send(os.freemem());
  });
  app.get('/device_info/totalmem', (req, res) => {
    res.send(os.totalmem());
  });
  app.get('/device_info/uptime', (req, res) => {
    res.send(os.uptime());
  });
  app.get('/device_info/homedir', (req, res) => {
    res.send(os.homedir());
  });
  app.get('/device_info/tempdir', (req, res) => {
    res.send(os.tempdir());
  });

  // Power
  app.get('/power/shutdown', (req, res) => {
    PowerManager.shutdown();
  });
  app.get('/power/restart', (req, res) => {
    PowerManager.restart();
  });
  app.get('/power/sleep', (req, res) => {
    PowerManager.sleep();
  });

  // Settings
  app.get('/settings/get', async (req, res) => {
    res.send(await Settings.getValue(req.query.name));
  });
  app.get('/settings/set', (req, res) => {
    Settings.setValue(req.query.name, req.query.value);
  });
  app.get('/settings/observe', (req, res) => {
    Settings.addObserver(req.query.name, (data) => {
      res.send(JSON.stringify(data));
    });
  });

  // Storage
  app.get('/storage/read', async (req, res) => {
    res.send(await StorageManager.read(req.query.path));
  });
  app.get('/storage/write', (req, res) => {
    StorageManager.write(req.query.path, req.query.data);
  });
  app.get('/storage/list', async (req, res) => {
    res.send(await StorageManager.list(req.query.path));
  });
  app.get('/storage/delete', (req, res) => {
    StorageManager.delete(req.query.path);
  });
  app.get('/storage/copy', (req, res) => {
    StorageManager.copy(req.query.path);
  });
  app.get('/storage/move', (req, res) => {
    StorageManager.move(req.query.path);
  });
  app.get('/storage/stats', async (req, res) => {
    res.send(await StorageManager.getFileStats(req.query.path));
  });
  app.get('/storage/mime', (req, res) => {
    res.send(StorageManager.getMime(req.query.path));
  });

  // Webapps
  app.get('/webapps/getall', async (req, res) => {
    res.send(await AppsManager.getAll());
  });
  app.get('/webapps/install', (req, res) => {
    AppsManager.installPackage(req.query.path);
  });
  app.get('/webapps/uninstall', (req, res) => {
    AppsManager.uninstall(req.query.id);
  });

  // Wifi
  app.get('/wifi/enable', (req, res) => {
    WifiManager.enable();
  });
  app.get('/wifi/disable', (req, res) => {
    WifiManager.disable();
  });
  app.get('/wifi/scan', async (req, res) => {
    res.send(await WifiManager.scan(req.query.duration));
  });
  app.get('/wifi/current_connections', async (req, res) => {
    res.send(await WifiManager.getCurrentConnections(req.query.id));
  });
  app.get('/wifi/delete', (req, res) => {
    WifiManager.delete(req.query.ssid);
  });
})();
