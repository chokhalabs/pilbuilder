const path = require("path");

module.exports = function override(config, env) {
  config.resolve.extensions.push('.pil');
  config.module.rules.push({
    test: /\.pil$/,
    loader: path.resolve(__dirname, './pil-loader.js'),
    exclude: /node_modules/
  });
  return config;
}
