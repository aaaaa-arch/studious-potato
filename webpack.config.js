module.exports = {
  target: "node",
  entry: "./src/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "index.js",
    libraryTarget: "commonjs2"
  },
  externals: {
    "fetch": "commonjs fetch",
    "console": "commonjs console",
    "setTimeout": "commonjs setTimeout",
    "gopeed": "commonjs gopeed"
  },
  mode: "production"
};
