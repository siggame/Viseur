var path = require('path');

module.exports = {
    entry: "./main.js",
    resolve: {
        root: path.resolve('./'),
        extensions: ['', '.js']
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.html$/, loader: "html" },
            { test: /\.hbs$/, loader: "handlebars" },
            { test: /\.json$/, loader: "json-loader" },
            { test: /\.scss$/, loaders: ["style", "css", "sass"] },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
        ]
    },
    node: {
      fs: "empty"
    },
    devtool: "#inline-source-map"
};