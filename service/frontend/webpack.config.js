const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const {
    DEV_SERVER_PORT,
    IS_PRODUCTION,
    SRC_FOLDER,
    OUTPUT_FOLDER,
    BROWSERS_LIST,
} = require("./config");

module.exports = {
    target: "web",

    entry: "./src/index.tsx",
    output: {
        path: OUTPUT_FOLDER,
        filename: "[name].js",
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader",
                exclude: /node_modules/,
                include: SRC_FOLDER,
            },

            {
                test: /\.(tsx|ts)$/,
                use: "ts-loader",
                exclude: /node_modules/,
                include: SRC_FOLDER,
            },

            {
                test: /\.s(c|a)ss$/,
                include: SRC_FOLDER,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "",
                        },
                    },

                    {
                        loader: require.resolve("css-loader"),
                        options: {
                            importLoaders: 1,
                            modules: {
                                localIdentName: IS_PRODUCTION
                                    ? "[name]__[local]__[hash:base64:8]"
                                    : "[path]__[name]__[local]",
                            },
                        },
                    },
                    {
                        loader: require.resolve("postcss-loader"),
                        options: {
                            postcssOptions: {
                                ident: "postcss",
                                plugins: () => [
                                    require("postcss-flexbugs-fixes"),
                                    autoprefixer({
                                        browsers: BROWSERS_LIST,
                                        flexbox: "no-2009",
                                    }),
                                    require("postcss-modules-values"),
                                ],
                            },
                        },
                    },
                    "sass-loader",
                ],
            },

            {
                test: /\.(png|jpe?g|svg|gif)$/,
                loader: "file-loader",
                options: {
                    outputPath: "./img/",
                    name: "[name].[ext]?[hash]",
                },
            },
        ],
    },

    devServer: {
        port: DEV_SERVER_PORT,
        open: true,
        hot: true,
        contentBase: path.resolve(__dirname, "./static"),
        compress: true,
        historyApiFallback: true,
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },

    plugins: [
        new MiniCssExtractPlugin(),

        new HtmlWebpackPlugin({
            favicon: "./src/images/favicon.ico",
            template: IS_PRODUCTION
                ? "./templates/index.production.html"
                : "./templates/index.development.html",
        }),

        new webpack.HotModuleReplacementPlugin(),
    ],
};
