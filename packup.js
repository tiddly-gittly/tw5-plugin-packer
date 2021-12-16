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
  // Boot tw5
  const tw = require('tiddlywiki/boot/boot').TiddlyWiki();
  tw.boot.argv = ['.'];
  tw.boot.boot();
  // Make output directory
  if (mkdirsSync(OUTPUT) === false) throw new Error(`Failed to create directory ${OUTPUT}.`);
  // Load plugin folders
  const successPlugins = [];
  SOURCE.forEach((plugin_source) => {
    const pluginInfo = tw.loadPluginFolder(plugin_source, undefined);
    if (typeof pluginInfo.title !== 'string' || pluginInfo.title === '') return;
    // Minify tiddlers
    if (MINIFY) {
      const tiddlersJson = JSON.parse(pluginInfo.text);
      const tiddlers = Object.keys(tiddlersJson.tiddlers);
      const len = tiddlers.length;
      for (let i = 0; i < len; i++) {
        var tiddler = tiddlersJson.tiddlers[tiddlers[i]];
        try {
          if (tiddler.type === 'application/javascript') {
            let minified = UglifyJS.minify(tiddler.text, UglifyJSOption).code;
            if (minified !== undefined) tiddler.text = minified;
          } else if (tiddler.type === 'text/css') {
            let minified = new CleanCSS(CleanCSSOptions).minify(tiddler.text).styles;
            if (minified !== undefined) tiddler.text = minified;
          }
        } catch (e) {
          console.error(`Failed to minify ${tiddler.title}.`);
        }
      }
      pluginInfo.text = JSON.stringify(tiddlersJson);
    }
    // Save JSON file
    const fileName = path.basename(tw.utils.generateTiddlerFilepath(pluginInfo.title, {})) + '.json';
    const filePath = path.join(OUTPUT, fileName);
    fs.writeFileSync(filePath, JSON.stringify(pluginInfo));
    successPlugins.push(filePath);
  });
  core.setOutput('output-plugins', successPlugins);
} catch (error) {
  core.setFailed(error.message);
}
