import { posix } from "path";
import serveStatic from "serve-static";
import externalGlobals from "rollup-plugin-external-globals";
import { copy } from "fs-extra";

const { join } = posix;

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

function vitePluginCesiumPlus(options?: VitePluginCesiumPlusOptions) {
  let {
    devMinifyCesium = false,
    cesiumBuildRootPath = "node_modules/cesium/Build",
    cesiumOutputPath = "cesium/",
  } = options || {};
  const cesiumBuildPath = join(cesiumBuildRootPath, "Cesium");
  let isBuild = false;
  let outDir = "";
  let CESIUM_BASE_URL = "";

  return {
    name: "vite-plugin-cesium-plus",
    config(config, { command }) {
      isBuild = command === "build";
      CESIUM_BASE_URL = join(config.base || "/", cesiumOutputPath);
      outDir = config.build?.outDir || "dist";

      return {
        define: {
          CESIUM_BASE_URL: JSON.stringify(CESIUM_BASE_URL),
        },
        build: {
          rollupOptions: {
            external: ["cesium"],
            plugins: [externalGlobals({ cesium: "Cesium" })],
          },
        },
      };
    },
    configureServer({ middlewares }) {
      const cesiumPath = join(
        cesiumBuildRootPath,
        devMinifyCesium ? "Cesium" : "CesiumUnminified"
      );
      middlewares.use(join("/", CESIUM_BASE_URL), serveStatic(cesiumPath));
    },
    transformIndexHtml() {
      const tags = [];
      if (isBuild) {
        tags.push({
          tag: "script",
          attrs: {
            src: join(CESIUM_BASE_URL, "Cesium.js"),
          },
        });
      }
      return tags;
    },
    async writeBundle() {
      if (isBuild) {
        try {
          await Promise.all(
            ["Assets", "ThirdParty", "Workers", "Widgets", "Cesium.js"].map(
              (name) =>
                copy(
                  join(cesiumBuildPath, name),
                  join(outDir, cesiumOutputPath, name)
                )
            )
          );
        } catch (err) {
          console.error("copy failed", err);
        }
      }
    },
  };
}
export default vitePluginCesiumPlus;
