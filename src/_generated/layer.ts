// Auto-generated from _entitydata.json - DO NOT EDIT
import { Layer, UILayer, SetLayers, SetUILayers, UI_LAYER } from "bare-engine";

const layers = {

} as const;

const uiLayers = {

} as const;

declare module "bare-engine" {
  interface LayerMap {
    OBJECTS: number;
  }
}

Object.assign(Layer, layers);
Object.assign(UILayer, uiLayers);

SetLayers(Layer);
SetUILayers(UILayer);
