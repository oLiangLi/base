const path = require('node:path');
const Goal = 'Build/tools/script/scenario.cjs';

const license = `
/*!
 *
 */`;

class WebpackHook {
    apply(compiler) {
        const webpack = compiler.webpack;
        compiler.hooks.thisCompilation.tap('WebpackHook', compilation=> {
            compilation.hooks.processAssets.tapAsync(
                {
                    name: 'WebpackHook',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
                },
                (compilationAssets, callback) => {
                    const origin = compilationAssets[Goal];
                    compilationAssets[Goal] = new webpack.sources.ConcatSource(license,
                        origin.source().replace(/^\/\*!.+\.LICENSE\.txt\s*\*\//, ''));

                    for(const name of Object.keys(compilationAssets)) {
                        if(name.endsWith('LICENSE.txt'))
                            delete compilationAssets[name];
                    }

                    callback();
                });
        });
    }
}

module.exports = {
    entry : path.join(__dirname, '../../.assets/scenario/index.js'),
    resolve: {
        extensions: ['.js'],
    },
    mode: 'production',
    target: 'node',
    output : {
        path: path.resolve(__dirname, '../..'),
        filename: Goal
    },

    plugins: [
        new WebpackHook()
    ]
}
