const path = require("path");
const fs = require("fs");

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

[
    path.join(__dirname, "../src/components"),
    path.join(__dirname, "../src/editorComponents")
].forEach(ensureDir);

module.exports = {
    entry: "./src/game.ts",
    output: {
        path: path.resolve(process.cwd(), "dist"),
        filename: "bundle.min.js"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
        alias: {
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "esbuild-loader",
                options: {
                    loader: "ts",
                    target: "es2020"
                }
            },
            {
                test: [/\.vert$/, /\.frag$/],
                use: "raw-loader"
            },
            {
                test: /\.(gif|png|jpe?g|svg|xml|glsl)$/i,
                use: "file-loader"
            },
            {
                test: /\.json$/,
                type: "json"
            }
        ]
    }
};
