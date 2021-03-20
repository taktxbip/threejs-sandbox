const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const fs = require('fs');
const path = require('path');

// Windows
const winPathBase = 'wp\\wp-content\\themes\\property-realli\\assets\\';
const winPathCSS = `${winPathBase}main.css`;
const winPathJS = `${winPathBase}main.js`;

console.log(process.platform);


module.exports = (env = {}) => {

    const { mode = 'development' } = env;

    const isProd = mode === 'production';
    const isDev = mode === 'development';

    const getStyleLoaders = () => {
        return [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
        ];
    };

    const runShell = () => {
        switch (process.platform) {
            case 'win32' : return [
                ''
            ];
            case 'linux': return [
                'ls'
            ];
            default: return false;
        }
    };

    const generateHtmlPlugins = (templateDir) => {
        const templateFiles = fs.readdirSync(templateDir);
        const path = templateDir.split('/')[1];
        return templateFiles.map(item => {
            return new HtmlWebpackPlugin({
                filename: item,
                template: `${path}/views/${item}`,
                minify: false
            });
        });
    };

    const getPlugins = () => {
        const plugins = [
            // Remove dist folder
            new CleanWebpackPlugin(),
            ...generateHtmlPlugins('./public/views')
        ];
        if (isProd) {
            plugins.push(new MiniCssExtractPlugin({
                filename: 'main.css'
            }));
            plugins.push(
                new WebpackShellPlugin({
                    onBuildExit: runShell()
                })
            );
        }
        return plugins;
    };

    console.log(mode);
    return {
        mode: isProd ? 'production' : isDev && 'development',

        output: {
            filename: isProd ? 'main.js' : undefined
        },

        module: {
            rules: [

                // Loading JS
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },

                // Loading Images
                {
                    test: /\.(png|jpe?g|gif|ico)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            outputPath: 'images',
                            name: '[name].[ext]'
                        }
                    }]
                },

                // Loading Fonts
                {
                    test: /\.(ttf|otf|eot|woff|woff2)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            outputPath: 'fonts',
                            name: '[name].[ext]'
                        }
                    }]
                },

                // Loading CSS
                {
                    test: /\.(css)$/,
                    use: [...getStyleLoaders(),
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer()
                            ],
                            sourceMap: true
                        }
                    }
                    ]
                },

                // Loading SCSS
                {
                    test: /\.(scss)$/,
                    use: [...getStyleLoaders(), {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer()
                            ],
                            sourceMap: true
                        }
                    },
                        'sass-loader']
                },
                {
                    test: /\.html$/,
                    include: path.resolve(__dirname, "public/includes"),
                    use: ["raw-loader"],
                },
            ]
        },

        plugins: getPlugins(),

        devServer: {
            open: true,
            historyApiFallback: true
        }
    };
};