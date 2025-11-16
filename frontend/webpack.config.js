const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/",
    clean: true, // cleans dist folder before build
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },

  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // REQUIRED!
      filename: "index.html",
    }),
  ],
};