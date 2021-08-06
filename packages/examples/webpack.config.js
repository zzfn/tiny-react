const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./src/index.js",
    mode: "development",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader']
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({template:'index.html'})
    ],
    devtool:'source-map',
    devServer: {
        inline: true,
        // hot:false
        hotOnly: true,
        open: true,
    },
};
