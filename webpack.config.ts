import * as HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";

export default (// tslint:disable-line:no-default-export
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    entry: [
        "@babel/polyfill/dist/polyfill.js", // polyfill new ES functions for babel
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
                            babelrc: true,
                        },
                    },
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {
                                // Keep es6+ imports in place for babel to handle.
                                // This allows the lodash treeshakers to work.
                                // This also means we are relying fully on babel for ESNext --> ES5 (or lower)
                                module: "esnext",
                            },
                        },
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
            minify: {
                collapseWhitespace: true,
            },
        }),
    ],
    optimization: {
        sideEffects: true,
        usedExports: true,
    },
    devtool: options.mode === "development"
        ? "inline-source-map"
        : false,
    performance: {
        hints: false, // TODO: handle these warnings
    },
});
