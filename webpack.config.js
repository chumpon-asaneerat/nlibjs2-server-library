const path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'development',
    watch: true,
    entry: { 
        //main: './app/js/main.js',
        //index: './src/index.js',
        app: './src/client/js/app.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    devtool: 'inline',
    optimization: {
        minimize: true
    },
    module: {
        rules: [{
            test: /\.(riot|tag)$/,
            exclude: /node_modules/,
            use: [{
                loader: '@riotjs/webpack-loader',
                options: { hot: true }
            }]
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-env'] }
            }
        }, {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: [
                {
                    // fallback to style-loader in development
                    loader: process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                },
                {
                    loader: 'css-loader',
                    options: { modules: false }
                },
                {
                    loader: "sass-loader"
                }
            ]
        }, {
            test: /\.css$/,
            exclude: /node_modules/,
            use: [
                // style-loader
                { 
                    loader: 'style-loader'
                },
                // css-loader
                {
                    loader: 'css-loader',
                    options: { modules: false }
                }
            ]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ]
}