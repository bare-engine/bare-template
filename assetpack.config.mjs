
import fs from "fs-extra";
import path from "node:path";

import { compress } from "@assetpack/core/image";
import { checkExt, createNewAssetAt, swapExt } from "@assetpack/core";
import { texturePacker } from "@assetpack/core/texture-packer";

const textureJsonToWebp = () => ({
  name: "texture-json-webp",
  test: (asset) => asset.allMetaData?.tps && checkExt(asset.path, ".json"),
  transform: async (asset) => {
    const json = JSON.parse(asset.buffer.toString());
    if (!json?.meta?.image) {
      return [asset];
    }
    const nextJson = JSON.parse(JSON.stringify(json));
    nextJson.meta.image = swapExt(nextJson.meta.image, ".webp");
    const nextAsset = createNewAssetAt(asset, asset.filename);
    nextAsset.buffer = Buffer.from(JSON.stringify(nextJson, null, 2));
    return [nextAsset];
  },
});

const tagRootAsTps = () => ({
  name: "tag-root-tps",
  test: (asset) => asset.isFolder && asset.rootAsset === asset,
  transform: async (asset) => {
    asset.metaData.tps = true;
    return [asset];
  },
});

const movePackedFromParent = () => ({
  name: "move-packed-from-parent",
  finish: async (_root, _options, pipeSystem) => {
    const outputDir = pipeSystem.outputPath;
    const parentDir = path.dirname(outputDir);
    const rootName = "texturePackImages"; // or derive from entry
    
    if (!fs.existsSync(parentDir)) {
      return;
    }
    
    const entries = fs.readdirSync(parentDir);
    for (const entry of entries) {
      // Match texturePackImages.json, texturePackImages.webp, etc.
      if (!entry.startsWith(rootName)) {
        continue;
      }
      const from = path.join(parentDir, entry);
      const to = path.join(outputDir, entry);
      fs.moveSync(from, to, { overwrite: true });
    }
  },
});

export default {
  entry: "./texturePackImages",
  output: "./public/assets/initial/generated",
  cache: false,
  ignore: ["*.png", "**/*"], // ignore all files/folders
  pipes: [
    tagRootAsTps(),
    texturePacker({
      texturePacker: {
        nameStyle: "relative",
        removeFileExtension: true,
        allowRotation: false, // SEEMS TO HAVE DIFFERENT BEHAVIOR THAN TEXTURE-PACKER ITSELF
        allowTrim: false, // SEEMS TO HAVE DIFFERENT BEHAVIOR THAN TEXTURE-PACKER ITSELF
      },
      resolutionOptions: {
        resolutions: { default: 1 },
        maximumTextureSize: 4096
      },
    }),
    compress({
      png: "skip",
      webp: {
        lossless: true,
      },
    }),
    textureJsonToWebp(),
    movePackedFromParent(),
  ],
};
