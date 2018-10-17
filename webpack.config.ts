import * as HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";

export default (// tslint:disable-line:no-default-export
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    entry: [
        "@babel/polyfill/dist/polyfill.js", // polyfill new es functions for babel
        "font-awesome/scss/font-awesome.scss", // font-awesome icons injection
        "src/index.ts", // our actual starting file now that stuff is ready
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            src: resolve(__dirname, "src/"),
        },
    },
    output: {
        filename: "js/[name].js",
        path: resolve(__dirname, "dist"),
        // publicPath: "dist/",
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            babelrc: true, // join(process.cwd(), "./babelrc"),
                        },
                    },
                    {
                        loader: "ts-loader",
                    },
                ],
            },
            {
                test: /\.(jpe?g|png|gif|ico|svg|ttf|otf|eot|woff|woff2)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "resources/",
                        },
                    },
                ],
            },
            {
                test: /\.hbs$/,
                use: {
                    loader: "handlebars-loader",
                    options: {
                        helperDirs: [ join(__dirname, "/src/handlebars-") ],
                        inlineRequires: "\/images\/",
                    },
                },
            },
            {
                test: /\.(css|sass|scss)$/,
                use: [
                    {
                        loader: "style-loader", // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader", // translates CSS into CommonJS
                    },
                    {
                        loader: "sass-loader", // compiles Sass to CSS
                    },
                ],
            },
        ],
    },
    node: {
        fs: "empty",
    },
    plugins: [
        // generate for us our index.html page
        new HtmlWebpackPlugin({
            title: "Viseur",
        }),

        /*
        // provides a great speedup in both module use and development debugging
        // https://webpack.js.org/plugins/commons-chunk-plugin/
        new webpack.optimize.CommonsChunkPlugin({
            names: ["node_modules"],
            minChunks: (module, count) => {
                // creates a common vendor js file for libraries in node_modules
                return isNodeModule(module);
            },
        }),
        */
    ],
    devtool: options.mode === "development"
        ? "source-map"
        : false,
    /*devServer: {
        historyApiFallback: true,
        watchOptions: { aggregateTimeout: 300, poll: 1000 },
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
        },
    },*/
    performance: {
        hints: false, // TODO: handle these warnings
    },
});
