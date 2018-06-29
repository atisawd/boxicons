const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    library: 'BoxIconElement',
    libraryTarget: 'umd',
    filename: 'box-icon-element.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
              ['env', { modules: false, targets: { uglify: true } }],
          ],
          plugins: [
            ['babel-plugin-transform-builtin-classes', {
              globals: ['Array', 'Error', 'HTMLElement'],
            }],
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
            { loader: 'to-string-loader' },
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'BUILD.DATA': {
        VERSION: JSON.stringify(packageJson.version),
      },
    }),
  ],
};
