import TsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import { resolve } from "path";
const AwsSamPlugin = require("aws-sam-webpack-plugin");

const awsSamPlugin = new AwsSamPlugin();

/** The base webpack config needed with a few optimizations. Some of this should explain itself. */
const baseConfig = {
  devtool: "source-map",
  entry: () => awsSamPlugin.entry(),   // Loads the entry object from the AWS::Serverless::Function resources in your SAM config
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Look for ts or tsx files (future-proofing)
        use: [
          {
            loader: "ts-loader", // We use ts-loader because Webpack doesn't understand TypeScript by default.
            options: {
              configFile: resolve('tsconfig.json'), // Load our config file, not required, but should we move it, we have it already.
              transpileOnly: true, // Fork-TS-Checker-Webpack-Plugin does the type-checking for us.
              experimentalWatchApi: true,
              happyPackMode: true
            },
          },
        ],
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: (chunkData) => awsSamPlugin.filename(chunkData),
    libraryTarget: "commonjs2",
    path: resolve('.') // CHECK
  },
  plugins: [
    awsSamPlugin,
    new TsCheckerPlugin({
      typescript: {
        build: true, // Build mode speeds up consequential builds (everything after the first build, based on the prior build)
        configFile: resolve('tsconfig.json'),
        mode: "write-tsbuildinfo",
      },
    })
  ],
  // stats: {
  //   warnings: false, // Turn off warnings, only express has warnings with Yarn 2 (future-proofing)
  // },
  target: "node", // Target Node.js instead of web browsers.
};

export default baseConfig;
