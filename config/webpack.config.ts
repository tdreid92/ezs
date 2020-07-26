import { CleanWebpackPlugin as CleanPlugin } from "clean-webpack-plugin";
import TsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import { resolve } from "path";
// const CleanPlugin = require(`pnp-webpack-plugin`);
// const TsCheckerPlugin = require(`fork-ts-checker-webpack-plugin`);
// const resolve = require(`path`);
import { Configuration } from "webpack";
// const PnpWebpackPlugin = require(`pnp-webpack-plugin`);
// const root = (pathToFile, filename) =>
//   resolve(__dirname, "..", filename ? `${pathToFile}/${filename}` : pathToFile);

/** Name of the entry and output file. */
const simpleEntryName = "file-example";
/** Determine if this a production build. */
const isProductionBuild: boolean = process.env.NODE_ENV == "production";
/** Resolve paths down from the root directory. */

const root = (pathToFile: string, filename?: string) =>
    resolve(__dirname, "..", filename ? `${pathToFile}/${filename}` : pathToFile);
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

/** The base webpack config needed with a few optimizations. Some of this should explain itself. */
const baseConfig = {
  devtool: "source-map",
  entry: paths.source.entry,
  mode: isProductionBuild ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Look for ts or tsx files (future-proofing)
        use: [
          {
            loader: "ts-loader", // We use ts-loader because Webpack doesn't understand TypeScript by default.
            options: {
              configFile: paths.config.tsconfig, // Load our config file, not required, but should we move it, we have it already.
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
  node: {
    __dirname: true, // Webpack has to manually solve __dirname references (future-proofing)
  },
  output: {
    filename: `${simpleEntryName}.js`, // We dynamically name the output based on the input.
    path: paths.build.root,
  },
  plugins: [
    new CleanPlugin(), // Clean the old files out on each run.
    new TsCheckerPlugin({
      async: !isProductionBuild, // Only report after a run, freeing the process to work faster
      typescript: {
        build: true, // Build mode speeds up consequential builds (evertyhing after the first build, based on the prior build)
        configFile: paths.config.tsconfig,
        mode: "write-tsbuildinfo",
        profile: !isProductionBuild, // Don't slow down production by profiling, only in development do we need this information.
      },
    }),
    {
      apply: (compiler) => {
        // This is a custom plugin (not imported) that tells Webpack to exit when done, since it tends to hang on CI servers.
        compiler.hooks.done.tap("DonePlugin", (_stats) => {
          if (isProductionBuild) {
            setTimeout(() => {
              console.log(`Compilation complete...`);
              process.exit(0);
            }, 0);
          }
        });
      },
    },
  ],
  stats: {
    warnings: false, // Turn off warnings, only express has warnings with Yarn 2 (future-proofing)
  },
  target: "async-node", // Target Node.js instead of web browsers.
  watch: !isProductionBuild, // When in development, we watch for changes, otherwise compile and exit.
};

export default baseConfig;
