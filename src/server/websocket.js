(function () {
  'use strict';

  const WebSocket = require('ws');
  const os = require('os');
  const wss = new WebSocket.Server({ port: 6222 }); // Set the desired port number

  const connectedServers = []; // Store connected WebSocket servers for forwarding

  // Function to get the local IP address
  function getLocalIpAddress () {
    const interfaces = os.networkInterfaces();
    for (const iface in interfaces) {
      const addresses = interfaces[iface];
      for (const addr of addresses) {
        if (addr.family === 'IPv4' && !addr.internal) {
          return addr.address;
        }
      }
    }
    return '127.0.0.1'; // Default to localhost if no suitable address is found
  }

  const localIpAddress = getLocalIpAddress();

  // Function to connect to other WebSocket servers within the network
  function connectToServer (serverPort) {
    const newServer = new WebSocket(`ws://${localIpAddress}:${serverPort}`);

    newServer.on('open', function () {
      console.log(`Connected to server at ${localIpAddress}:${serverPort}`);
      connectedServers.push(newServer);
    });

    newServer.on('close', function () {
      console.log(`Connection to server at ${localIpAddress}:${serverPort} closed`);
      const index = connectedServers.indexOf(newServer);
      if (index > -1) {
        connectedServers.splice(index, 1);
      }
    });

    newServer.on('error', function (error) {
      console.error(`Error with connection to ${localIpAddress}:${serverPort}:`, error.message);
    });
  }

  // Example: Connect to another server within the home network
  // Adjust the port as needed for your setup
  connectToServer(6223); // Example server port

  module.exports = function () {
    wss.on('connection', function connection (ws) {
      console.log('A new client connected');

      ws.on('message', function incoming (message) {
        console.log('Received: %s', message);

        // Broadcast the received message to all connected clients
        wss.clients.forEach(function each (client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });

        // Forward the received message to connected servers
        connectedServers.forEach(function forward (server) {
          if (server.readyState === WebSocket.OPEN) {
            server.send(message);
          }
        });
      });

      ws.on('close', function close () {
        console.log('A client disconnected');
      });
    });
  };
})();
