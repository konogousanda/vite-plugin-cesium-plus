## Install

```bash
npm install vite-plugin-cesium-plus -D
```

## Usage

add the plugin to `vite.config.js`

```js
import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium-plus';
export default defineConfig({
    plugins: [cesium()]
});
```

## Type Declarations

```js
interface VitePluginCesiumPlusOptions {
    /**
     * Use compiled files in the development environment
     * @default false
     */
    devMinifyCesium?: boolean;
    /**
     * Cesium source file root path
     * @default "node_modules/cesium/Build"
     */
    cesiumBuildRootPath?: string;
    /**
     * Compiled Cesium code output directory
     * @default "cesium/"
     */
    cesiumOutputPath?: string;
}
```