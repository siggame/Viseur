import * as GitRevisionPlugin from "git-revision-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";

const gitRevisionPlugin = new GitRevisionPlugin();

export default (
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    entry: [
        "core-js/stable/index.js", // polyfill new ES functions for babel
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
                test: /\.(jpe?g|png|gif|ico|svg|ttf|otf|eot|woff|woff2|gamelog)$/i,
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
                        helperDirs: [join(__dirname, "/src/handlebars-")],
                        inlineRequires: "/images/",
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
        // ^ TS definition are old and deprecated. HtmlWebpackPlugin will have defs in 4.0, this is a hack till then
        gitRevisionPlugin,
        new webpack.DefinePlugin({
            "process.env.DEVELOPMENT": options.mode === "development",
            "process.env.GIT_VERSION": JSON.stringify(
                gitRevisionPlugin.version(),
            ),
            "process.env.GIT_COMMIT_HASH": JSON.stringify(
                gitRevisionPlugin.commithash(),
            ),
            "process.env.GIT_BRANCH": JSON.stringify(
                gitRevisionPlugin.branch(),
            ),
        }),
        new webpack.ProvidePlugin({
            PIXI: "pixi.js", // TypeScript definitions inject this into global scope, so let's make that true at runtime
        }),
    ],
    optimization: {
        sideEffects: true,
        usedExports: true,
    },
    devtool: options.mode === "development" ? "inline-source-map" : false,
    performance: {
        hints: false, // TODO: handle these warnings
    },
});
