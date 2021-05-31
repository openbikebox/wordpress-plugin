const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
    const isDevelopment = argv.mode !== 'production';
    let result = {
        entry: [
            `./assets/js/base.js`,
            `./assets/js/webapp.js`
        ],
        resolve: {
            alias: {
                './images/layers.png$': path.resolve(__dirname, '../static/images/leaflet/layers.png'),
                './images/layers-2x.png$': path.resolve(__dirname, '../static/images/leaflet/layers-2x.png'),
                './images/marker-icon.png$': path.resolve(__dirname, '../static/images/leaflet/marker-icon.png'),
                './images/marker-icon-2x.png$': path.resolve(__dirname, '../static/images/leaflet/marker-icon-2x.png'),
                './images/marker-shadow.png$': path.resolve(__dirname, '../static/images/leaflet/marker-shadow.png')
            }
        },
        mode: isDevelopment ? 'development' : argv.mode,
        output: {
            path: path.join(__dirname, '..', 'static', 'js'),
            publicPath: '/static/js',
            filename: 'webapp.[contenthash].js',
        },
        optimization: {
            minimize: !isDevelopment
        },
        performance: {
            hints: false
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[path][name].[ext]',
                                publicPath: '/wp-content/plugins/open-bike-box'
                            }
                        },
                    ],
                },
                {
                    test: /\.module\.s(a|c)ss$/,
                    loader: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                sourceMap: isDevelopment
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDevelopment
                            }
                        }
                    ]
                },
                {
                    test: /\.s(a|c)ss$/,
                    exclude: /\.module.(s(a|c)ss)$/,
                    loader: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDevelopment
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'file-loader',
                    options: {
                        outputPath: '../fonts',
                        publicPath: '/static/fonts'
                    },
                }
            ]
        },
        devtool: isDevelopment ? "eval-source-map" : "source-map",
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
            }),
            new MiniCssExtractPlugin({
                filename: '../css/webapp.[contenthash].css',
                chunkFilename: '[id].[hash].css'
            }),
            new CleanWebpackPlugin(),
            new MomentTimezoneDataPlugin({
                matchZones: ["Europe/Berlin", 'Etc/UTC'],
                startYear: 2000,
                endYear: 2030,
            }),
            new AssetsPlugin({path: path.join(__dirname, '..', "static")})
        ],
        externals: {
            jquery: 'jQuery'
        }
    };
    if (isDevelopment) {
        result.plugins.push(
            new BundleAnalyzerPlugin({
                analyzerHost: '0.0.0.0'
            })
        );
    }
    return result;
};

