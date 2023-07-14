const path = require('path');
const si = require("systeminformation");

document.addEventListener('DOMContentLoaded', function () {
  if (document.readyState === "complete") {}

  AppWindow.create('http://homescreen.localhost:8081/manifest.json');
});
