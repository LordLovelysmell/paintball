const { info } = require("console");
const path = require("path");
const webpack = require("webpack");

module.exports = (env) => ({
  context: __dirname,
  mode: "development",
  entry: "./src/index.ts",
  stats: "errors-only",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  devtool: "source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000,
    watchFiles: ["src/**/*.js", "public/**/*"],
    hot: true,
    client: {
      logging: "log",
      progress: true,
    },
  },
  experiments: {
    topLevelAwait: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
      path: false, // ammo.js seems to also use path
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.RESULT": JSON.stringify(env.result),
    }),
  ],
});
