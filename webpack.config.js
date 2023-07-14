const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: getEntryPoints(),
  output: {
    path: path.resolve(__dirname, 'webapps'),
    filename: '[name]/dist/[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]/dist/[name].bundle.css',
    }),
  ],
};

function getEntryPoints() {
  const entryPoints = {};
  const websites = glob.sync('./webapps/*/src/index.js');
  websites.forEach((website) => {
    const websiteName = website.match(/\.\/webapps\/(.+)\/src\/index.js/)[1];
    entryPoints[websiteName] = website;
  });
  return entryPoints;
}
