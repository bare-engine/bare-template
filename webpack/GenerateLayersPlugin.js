const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../public/assets/_data/_entityData.json');
const outputPath = path.join(__dirname, '../src/_generated/layer.ts');

function toConstantCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

function generateLayers() {
    try {
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);
        const layers = data.layers || [];
        const uiLayers = data.uiLayers || [];

        const layerEntries = layers
            .map((name, index) => `  ${toConstantCase(name)}: ${index},`)
            .join('\n');

        const uiLayerEntries = uiLayers
            .map((name, index) => {
                if (index === 0) return `  ${toConstantCase(name)}: UI_LAYER,`;
                return `  ${toConstantCase(name)}: UI_LAYER + ${index},`;
            })
            .join('\n');

        const typeEntries = Array.from(new Set(["OBJECTS", ...layers.map(toConstantCase)]))
            .map((name) => `    ${name}: number;`)
            .join('\n');

        const output = `// Auto-generated from _entitydata.json - DO NOT EDIT
import { Layer, UILayer, SetLayers, SetUILayers, UI_LAYER } from "bare-engine";

const layers = {
${layerEntries}
} as const;

const uiLayers = {
${uiLayerEntries}
} as const;

declare module "bare-engine" {
  interface LayerMap {
${typeEntries}
  }
}

Object.assign(Layer, layers);
Object.assign(UILayer, uiLayers);

SetLayers(Layer);
SetUILayers(UILayer);
`;

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf-8') : '';
        if (existing !== output) {
            fs.writeFileSync(outputPath, output);
            console.log(`✓ Generated layers.ts with ${layers.length} layers and ${uiLayers.length} UI layers`);
        }
    } catch (error) {
        console.error('Error generating layers:', error);
    }
}

class GenerateLayersPlugin {
    apply(compiler) {
        // Generate on startup
        generateLayers();

        // Watch entityData.json
        if (compiler.options.mode === 'development') {
            fs.watch(jsonPath, (eventType) => {
                if (eventType === 'change') {
                    generateLayers();
                }
            });
        }
    }
}

module.exports = GenerateLayersPlugin;
