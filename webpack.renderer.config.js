const rules = require('./webpack.rules');
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  plugins: [
    new MomentLocalesPlugin({
      localesToKeep: ['tr'],
    }),
  ],
  module: {
    rules,
  },
  resolve:{
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },
};
