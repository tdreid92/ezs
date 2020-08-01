import { CleanWebpackPlugin as CleanPlugin } from "clean-webpack-plugin";
import TsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import { resolve } from "path";
const AwsSamPlugin = require("aws-sam-webpack-plugin");

const awsSamPlugin = new AwsSamPlugin();
// const CleanPlugin = require(`pnp-webpack-plugin`);
// const TsCheckerPlugin = require(`fork-ts-checker-webpack-plugin`);
// const resolve = require(`path`);
import { Configuration } from "webpack";
// const PnpWebpackPlugin = require(`pnp-webpack-plugin`);
// const root = (pathToFile, filename) =>
//   resolve(__dirname, "..", filename ? `${pathToFile}/${filename}` : pathToFile);

/** Name of the entry and output file. */
const simpleEntryName = "file-example";
/** Resolve paths down from the root directory. */

const root = (pathToFile: string, filename?: string) =>
    resolve(__dirname, filename ? `${pathToFile}/${filename}` : pathToFile);
/** An object containing all required paths, this keeps things up-to-date. */
const paths = {
  source: {
    entry: root("src", `${simpleEntryName}.ts`),
    root: root("src"),
  },
  build: {
    root: root("dist"),
  },
  config: {
    tsconfig: root("tsconfig.json"),
  },
};
console.log("PATH" + paths.config.tsconfig);
console.log("Current directory:", __dirname);
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
  // node: {
  //   __dirname: true, // Webpack has to manually solve __dirname references (future-proofing)
  // },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: (chunkData) => awsSamPlugin.filename(chunkData),
    libraryTarget: "commonjs2",
    path: paths.build.root // CHECK
  },
  plugins: [
    awsSamPlugin,
    new CleanPlugin(), // Clean the old files out on each run.
    new TsCheckerPlugin({
      typescript: {
        build: true, // Build mode speeds up consequential builds (evertyhing after the first build, based on the prior build)
        configFile: resolve('tsconfig.json'),
        mode: "write-tsbuildinfo",
      },
    })
  ],
  stats: {
    warnings: false, // Turn off warnings, only express has warnings with Yarn 2 (future-proofing)
  },
  target: "async-node", // Target Node.js instead of web browsers.
};

export default baseConfig;
