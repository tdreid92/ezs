import { resolve } from 'path';
import webpack, { Configuration } from 'webpack';
import TsCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import AwsSamPlugin from 'aws-sam-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
const awsSamPlugin = new AwsSamPlugin();

/** The base webpack config needed with a few optimizations. Some of this should explain itself. */
const baseConfig: Configuration = {
  devtool: 'source-map', // Provides the best quality with the complete result, but also the slowest option for webpack performance
  entry: () => awsSamPlugin.entry(), // Loads the entry object from the AWS::Serverless::Function resources in your SAM config
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Look for ts or tsx files (future-proofing)
        use: [
          {
            loader: 'ts-loader', // We use ts-loader because Webpack doesn't understand TypeScript by default.
            options: {
              configFile: resolve('tsconfig.json'), // Load our config file, not required, but should we move it, we have it already.
              transpileOnly: true, // Disable because Fork-TS-Checker-Webpack-Plugin does the type-checking for us.
              experimentalWatchApi: true, // Consumes the internal TS watch mode APIs and dramatically decreases number of modules for rebuild per iteration. Equivalent to TS watch mode
              happyPackMode: true // Must be enabled in conjunction with transpileOnly for Fork-TS-Checker-Webpack-Plugin
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: false // Improves resolve speed. Must enable if using symlinks (npm link or yarn link)
  },
  output: {
    filename: (chunkData) => awsSamPlugin.filename(chunkData),
    libraryTarget: 'commonjs2',
    path: resolve('.'),
    pathinfo: false // Generate path info in output bundle. This puts garbage collection pressure on projects that bundle thousands of modules. Disabling improves webpack performance
  },
  plugins: [
    awsSamPlugin, // Add the AWS SAM Webpack plugin. Replaces the SAM build step for AWS SAM CLI projects
    new TsCheckerPlugin({
      eslint: {
        files: ['./src/**/*.ts', './layers/**/*.ts'],
        options: {
          cache: true,
          cacheLocation: '.eslintcache'
        }
      },
      typescript: {
        build: true, // Build mode speeds up consequential builds (everything after the first build, based on the prior build)
        configFile: resolve('tsconfig.json'),
        mode: 'write-tsbuildinfo'
      }
    }),
    new ProgressBarPlugin(),
    {
      apply(compiler: webpack.Compiler): void {
        // This is a custom plugin (not imported) that tells Webpack to exit when done, since it tends to hang on CI servers.
        compiler.hooks.done.tap('DonePlugin', (_stats) => {
          setTimeout(() => {
            // eslint-disable-next-line no-console
            console.log(`Compilation complete...`);
            process.exit(0);
          }, 0);
        });
      }
    }
  ],
  target: 'node' // Target Node.js instead of web browsers.
};

export default baseConfig;
