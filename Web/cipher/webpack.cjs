const path = require("node:path");
const Goal = "Build/html/js/jsWorld.js";

const license = `
/*!
 * The jsCipherSuite for node.js && the browser.
 *
 * @author   LiangLI
 * @license  MIT
 *
 * TODO:
 *   1) More testing && documents ...
 */
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
`;

class WebpackHook {
  apply(compiler) {
    const webpack = compiler.webpack;
    compiler.hooks.thisCompilation.tap("WebpackHook", (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: "WebpackHook",
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        (compilationAssets, callback) => {
          const origin = compilationAssets[Goal];
          compilationAssets[Goal] = new webpack.sources.ConcatSource(
            license,
            origin.source().replace(/^\/\*!.+\.LICENSE\.txt\s*\*\//, "")
          );

          for (const name of Object.keys(compilationAssets)) {
            if (name.endsWith("LICENSE.txt")) delete compilationAssets[name];
          }

          callback();
        }
      );
    });
  }
}

module.exports = {
  entry: path.join(__dirname, "../../.assets/cipher/jsCipher.js"),

  resolve: {
    extensions: [".js"],
  },
  mode: "production",
  target: "web",
  output: {
    path: path.resolve(__dirname, "../.."),
    filename: Goal
  },

  plugins: [
    new WebpackHook()
  ],
};
