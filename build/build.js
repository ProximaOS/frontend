#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { env } = require('process');

const webappListPath = path.join(process.cwd(), 'build', 'webapps', 'development.json');
const outputPath = path.join(process.cwd(), 'build_stage');

fs.readFile(path.join(webappListPath), { encoding: 'utf-8' }, (error, data) => {
  if (error) {
    console.log(error);
    return;
  }
  const json = JSON.parse(data);

  json.forEach(webapp => {
    if (env.APP === path.dirname(webapp) || !env.APP) {
      // require('./build-manifests')(webapp, outputPath);
      require('./build-webapps')(webapp, outputPath);
    }
  });
});
