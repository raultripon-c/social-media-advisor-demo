const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const deps = require("./package.json").dependencies;
const isProd =
  process.argv.includes("--mode=production") ||
  process.env.NODE_ENV === "production";

module.exports = {
  entry: {
    app: "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: isProd,
  },
  mode: isProd ? "production" : "development",
  devtool: isProd
    ? process.env.GENERATE_SOURCEMAP === "true"
      ? "source-map"
      : false
    : "eval-cheap-module-source-map",
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',  // Allow cross-origin access
    },
    hot: true,
    liveReload: true,
    allowedHosts: [
      ".phenompro.com",
      ".phenom.com",
      ".phenomxai.com",
      ".phenomhub.net",
      ".phenompeople.com",
    ],
    historyApiFallback: true,
    client: {
      overlay: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(gif|svg|jpg|png)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 81920000 // inline files smaller than 80KB
          }
        },
        generator: {
          filename: '[name].[hash][ext]'
        }
      },
      {
        test: /\.(scss|css|sass)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: { url: false },
          },
          {
            loader: "sass-loader", // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      publicPath: "/",
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new ModuleFederationPlugin({
      name: "servicehub",
      filename: "servicehub.js",

      exposes: {},
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: deps["react"],
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: deps["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          eager: true,
          requiredVersion: deps["react-router-dom"],
        },
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/assets", to: "assets" },
        { from: "public", to: "public" },
        { from: "src/assets", to: "public/assets" },
      ],
      options: {
        concurrency: 100,
      },
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    fallback: {
      fs: false,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
  target: "web",
};
