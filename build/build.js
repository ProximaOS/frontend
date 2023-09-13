const fs = require('fs');
const path = require('path');
const { env } = require('process');

const outputPath = path.join(process.cwd(), 'build_stage');

fs.readFile(path.join(process.cwd(), webappListPath), { encoding: 'utf-8' }, (error, data) => {
  if (error) {
    console.log(error);
    return;
  }
  const json = JSON.parse(data);

  for (const webapp in json) {
    if (env.APP === path.dirname(webapp) || !env.APP) {
      // require('./build-manifests')(webapp, outputPath);
      require('./build-webapps')(webapp, outputPath);
    }
  }
});
