const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InjectInitialAssetsPlugin = require("./InjectInitialAssetsPlugin");

function createBasePlugins(mode) {
    const isProd = mode === "production";
    const cleanOptions = isProd
        ? undefined
        : { cleanOnceBeforeBuildPatterns: [path.join(__dirname, "dist/**/*")] };

    return {
        clean: cleanOptions ? new CleanWebpackPlugin(cleanOptions) : new CleanWebpackPlugin(),
        html: new HtmlWebpackPlugin(
            isProd
                ? { template: "./index.html", inject: false, minify: false }
                : { template: "./index.html", scriptLoading: "blocking", inject: "head" }
        ),
        inject: new InjectInitialAssetsPlugin()
    };
}

module.exports = { createBasePlugins };
