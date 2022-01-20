const core = require('@actions/core');
const path = require('path');
const fs = require('fs');
const UglifyJS = require('uglify-es');
const CleanCSS = new require('clean-css');

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) return true;
    mkdirsSync(path.dirname(dirname));
    return fs.mkdirSync(dirname);
}

try {
    // Parse params
    const SOURCE = core.getMultilineInput('source');
    const OUTPUT = core.getInput('output');
    const MINIFY = core.getInput('minify') === 'true';
    const UGLIFYJS_OPTIONS = core.getInput('uglifyjs-options');
    const CLEANCSS_OPTIONS = core.getInput('cleancss-options');
    let UglifyJSOption, CleanCSSOptions;
    try {
        UglifyJSOption = JSON.parse(UGLIFYJS_OPTIONS);
    } catch (e) { };
    try {
        CleanCSSOptions = JSON.parse(CLEANCSS_OPTIONS);
    } catch (e) { };
    if (UglifyJSOption === undefined) UglifyJSOption = {
        warnings: false,
        ie8: true,
        safari10: true,
    };
    if (CleanCSSOptions === undefined) CleanCSSOptions = {
        compatibility: 'ie8',
        level: 2,
    };
    console.log('Checking options:');
    console.log(` - Minify: ${MINIFY}`);
    console.log(` - Output: ${OUTPUT}`);
    console.log(' - Input:');
    SOURCE.forEach((plugin_source) => {
        console.log(`  - ${plugin_source}`);
    });
    console.log(' - UglifyJSOption:');
    console.log(UglifyJSOption);
    console.log(' - CleanCSSOptions:');
    console.log(CleanCSSOptions);
    // Boot tw5
    console.log('Booting up tiddlywiki core.');
    const tw = require('tiddlywiki/boot/boot').TiddlyWiki();
    tw.boot.argv = ['.'];
    tw.boot.boot();
    // Make output directory
    console.log('Creating output directory.');
    if (mkdirsSync(OUTPUT) === false) throw new Error(`Failed to create directory ${OUTPUT}.`);
    // Load plugin folders
    const successPlugins = [];

    console.log('plugins:');
    console.log(fs.readdirSync('plugins'));
    console.log('===================');
    console.log('plugins/bimlas:');
    console.log(fs.readdirSync('plugins/bimlas'));
    console.log('===================');
    console.log('plugins/bimlas/kin-filter:');
    console.log(fs.readdirSync('plugins/bimlas/kin-filter'));
    console.log('===================');


    console.log(`Start packing up ${SOURCE.length} plugins:`);
    SOURCE.forEach((plugin_source) => {
        console.log(` - Packing up plugin ${plugin_source}.`);
        const pluginInfo = tw.loadPluginFolder(plugin_source, undefined);
        if (!pluginInfo || typeof pluginInfo.title !== 'string' || pluginInfo.title === '') {
            console.log(` - Plugin is unavailable, dose it exist and has a plugin.info file?`);
            return;
        }
        console.log(` - Plugin name is ${pluginInfo.title}.`);
        // Minify tiddlers
        if (MINIFY) {
            const tiddlersJson = JSON.parse(pluginInfo.text);
            const tiddlers = Object.keys(tiddlersJson.tiddlers);
            const len = tiddlers.length;
            for (let i = 0; i < len; i++) {
                const tiddler = tiddlersJson.tiddlers[tiddlers[i]];
                try {
                    if (tiddler.type === 'application/javascript') {
                        console.log(`  -Try minifying JS tiddler ${tiddlers[i]}.`);
                        const minified = UglifyJS.minify(tiddler.text, UglifyJSOption).code;
                        if (minified !== undefined) tiddler.text = minified;
                    } else if (tiddler.type === 'text/css') {
                        console.log(`  -Try minifying CSS tiddler ${tiddlers[i]}.`);
                        const minified = new CleanCSS(CleanCSSOptions).minify(tiddler.text).styles;
                        if (minified !== undefined) tiddler.text = minified;
                    }
                } catch (e) {
                    console.error(e);
                    console.error(`Failed to minify ${tiddlers[i]}.`);
                }
            }
            pluginInfo.text = JSON.stringify(tiddlersJson);
        }
        // Save JSON file
        console.log(`  - Saving plugin ${pluginInfo.title}.`);
        const fileName = path.basename(tw.utils.generateTiddlerFilepath(pluginInfo.title, {})) + '.json';
        const filePath = path.join(OUTPUT, fileName);
        fs.writeFileSync(filePath, JSON.stringify(pluginInfo));
        console.log(`  - Plugin ${pluginInfo.title} has been saved to ${filePath}.`);
        successPlugins.push(filePath);
    });
    core.setOutput('output-plugins', successPlugins);
    console.log(`Successfully packed ${successPlugins.length} plugins.`);
} catch (error) {
    console.error(error);
    core.setFailed(error.message);
}
