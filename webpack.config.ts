import path from 'path';
import webpack from 'webpack';
import 'webpack-dev-server';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { InjectManifest } from 'workbox-webpack-plugin';
const SitemapPlugin = require('sitemap-webpack-plugin').default;
//import CompressionPlugin from 'compression-webpack-plugin';
//import zlib from 'zlib';

const devMode = process.env['NODE_ENV'] === 'development';
const DISABLE_SERVICE_WORKER_IN_DEV_MODE = true;

let plugins: webpack.WebpackPluginInstance[] = [];

//
// Compression plugins
//

/*
TODO: Currently the compression plugins are disabled because they compress before the html bundler does its job. Fix this.
if (!devMode) {
    plugins.push(new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg|xml)$/,
        threshold: 1, // Compress files regardless of size! We want maximum performance.
        deleteOriginalAssets: false,
    }));
    plugins.push(new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        compressionOptions: {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            },
        } as zlib.ZlibOptions,
        test: /\.(js|css|html|svg|xml)$/,
        threshold: 1, // same as above
        deleteOriginalAssets: false,
    }));
}
*/

//
// HTML bundler
//

plugins.push(new HtmlBundlerPlugin({
    entry: {
        index: './src/templates/index.html',
        imprint: './src/templates/imprint.html',
        offline: './src/templates/offline.html',
        err404: './src/templates/err404.html',
    },
    js: {
        inline: false,
        filename: 'static/[name].[contenthash].js',
    },
    css: {
        inline: !devMode,
        filename: 'static/[name].[contenthash].css',
    },
    preprocessor: 'eta',
    preprocessorOptions: {
        async: true, // enable async support so we can use await in our templates
    },
    minify: 'auto', // minify in production only
}));


//
// Service worker
//

const injectPlugin = new InjectManifest({
    swSrc: path.resolve(__dirname, 'src', 'scripts', 'sw.ts'),
    swDest: path.resolve(__dirname, 'dist', 'sw.js'),
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
    exclude: [
        /.+\.html_.+\.css/, // don't cache non-existent *.html_*.css files, like index.html_styles.css
        /err404\.html$/,
        /sitemap\.xml$/,
        /robots\.txt$/,
    ],
    ...((devMode && DISABLE_SERVICE_WORKER_IN_DEV_MODE) ? { exclude: [/./] } : undefined),
});
if (devMode) {
    // Taken from https://github.com/GoogleChrome/workbox/issues/1790#issuecomment-1241356293
    // Suppress the "InjectManifest has been called multiple times" warning by reaching into
    // the private properties of the plugin and making sure it never ends up in the state
    // where it makes that warning.
    // https://github.com/GoogleChrome/workbox/blob/v6/packages/workbox-webpack-plugin/src/inject-manifest.ts#L260-L282
    Object.defineProperty(injectPlugin, "alreadyCalled", {
        get() {
            return false;
        },
        set() {
            // noop
        },
    });
}
plugins.push(injectPlugin);


//
// Site map, robots.txt, etc.
//
plugins.push(new SitemapPlugin({
    base: 'https://die-lage.at',
    paths: [
        '/',
        '/imprint.html',
    ],
    options: {
        filename: 'sitemap.xml',
        changefreq: 'monthly',
        skipgzip: true, // handled by CompressionPlugin
    },
}));

plugins.push(new CopyPlugin({
    patterns: [
        { from: './src/robots.txt', to: './' },
        { from: './src/icons/favicon.ico', to: './' },
        { from: './src/icons/*.png', to: './icons/[name][ext]' },
        { from: './src/screenshots/*', to: './screenshots/[name][ext]' },
        { from: './src/app.webmanifest', to: './' },
        { from: './src/styles/fonts/*', to: './fonts/' },
    ],
}));

const config: webpack.Configuration = {
    mode: devMode ? 'development' : 'production',
    devtool: devMode ? 'source-map' : undefined,
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
    },
    target: 'web',
    entry: [
        './src/scripts/main.ts',
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'static/[name].[contenthash].js',
        cssFilename: 'static/[name].[contenthash].css',
    },
    resolve: {
        extensions: ['.html', '.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.sass'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            {
                test: /\.(sa|sc|c)ss$/i,
                exclude: /node_modules/,
                use: [
                    'css-loader',
                    !devMode && {
                        loader: 'postcss-loader',
                        options: {},
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|webp|avif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(svg)$/i,
                type: 'asset/inline',
            },
            {
                test: /\.webmanifest$/i,
                use: [
                    'webpack-webmanifest-loader',
                ],
                type: 'asset/resource',
            },
        ],
    },
    plugins,
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin(),
        ],
    },
};

export default config;

