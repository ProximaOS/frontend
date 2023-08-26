!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const http = require('http');
  const AdmZip = require('adm-zip');

  require('dotenv').config();

  module.exports = function (app) {
    const webAppsDir = process.env.OPENORCHID_WEBAPPS;
    const files = fs.readdirSync(webAppsDir);

    files.forEach((dir) => {
      const subdomain = dir.split('.')[0];

      const localServer = http.createServer((req, res) => {
        const host = req.headers.host || '';
        const subdomain = host.split('.')[0];

        function sendRequest (data, contentType) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.setHeader('Content-Type', contentType); // Set the content type header
          res.writeHead(200);
          res.end(data);
        }

        let filePath;
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
          const contentType = getContentType(path.extname(zipEntry.entryName));
          sendRequest(data, contentType); // Pass the content type to sendRequest
        } else {
          filePath = path.join(webAppsDir, subdomain, req.url);

          fs.readFile(filePath, (err, data) => {
            if (err) {
              res.writeHead(404);
              res.end('File not found');
              return;
            }
            const contentType = getContentType(path.extname(filePath));
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

  function getContentType (fileExt) {
    switch (fileExt.toLowerCase()) {
      case '.html':
        return 'text/html';
      case '.css':
        return 'text/css';
      case '.js':
        return 'text/javascript';
      case '.json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
})();
