const webpack = require('webpack');
const configDev = require('../webpack.dev.js');
const configProd = require('../webpack.prod.js');

const compiler = webpack(
  process.env.NODE_ENV === 'production' ? configProd : configDev
);

compiler.run((error, stats) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log(
    stats.toString({
      chunks: false, // Makes the build much quieter
      colors: true // Shows colors in the console
    })
  );

  if (stats.hasErrors()) {
    console.error('Webpack build failed with errors');
    process.exit(1);
  }

  console.log('Webpack build complete');
});
