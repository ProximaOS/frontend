const os = require("os");
const fs = require("fs");
const path = require("path");
const http = require("http");

function getWebappsPath() {
  if (os.platform() === "win32") {
    return path.join(process.cwd(), "webapps");
  } else if (os.platform() === "linux") {
    if (require("electron-is-dev")) {
      return path.join(process.cwd(), "webapps");
    } else {
      return path.join("data", "local", "webapps");
    }
  } else {
    return path.join(os.homedir(), "webapps");
  }
}

module.exports = function() {
  const webAppsDir = getWebappsPath();
  const files = fs.readdirSync(webAppsDir);

  files.forEach((dir) => {
    const localServer = http.createServer((req, res) => {
      // Extract the subdomain from the host header
      const host = req.headers.host || "";
      const subdomain = host.split(".")[0];

      const filePath = path.join(webAppsDir, subdomain, req.url);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("File not found");
          return;
        }

        // Disable CORS by setting appropriate response headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        res.writeHead(200);
        res.end(data);
      });
    });

    const subdomain = dir.split(".")[0];
    localServer.listen(8081, "localhost", () => {
      console.log(
        `Server for subdomain ${subdomain} running at http://${subdomain}.localhost:8081`
      );
    });
  });
};
