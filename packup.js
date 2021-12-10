const core = require('@actions/core');
const path = require('path');
const fs = require('fs');

function mkdirsSync(dirname) {
    if (!fs.existsSync(dirname) && mkdirsSync(path.dirname(dirname))) {
        return fs.mkdirSync(dirname);
    }
}

try {
  // Get params
  const SOURCE = core.getMultilineInput('source');
  const OUTPUT = core.getInput('output');
  // Boot tw5
  const tw = require('tiddlywiki/boot/boot').TiddlyWiki();
  tw.boot.argv = ['.'];
  tw.boot.boot();
  // Make output directory
  mkdirsSync(OUTPUT);
  // Load plugin folders
  successPlugins = [];
  SOURCE.forEach((plugin_source) => {
    let pluginInfo = tw.loadPluginFolder(plugin_source, undefined);
    if (typeof pluginInfo.title !== 'string' || pluginInfo.title === '') return;
    let fileName = path.basename(tw.utils.generateTiddlerFilepath(pluginInfo.title, {})) + '.json';
    let filePath = path.join(OUTPUT, fileName);
    // Output json file
    fs.writeFileSync(filePath, JSON.stringify(pluginInfo));
    successPlugins.push(filePath);
  });
  core.setOutput('output-plugins', successPlugins);
} catch (error) {
  core.setFailed(error.message);
}
