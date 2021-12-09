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
  const SOURCE = core.getInput('source');
  const OUTPUT = core.getInput('output');
  // Boot tw5
  const tw = require('tiddlywiki/boot/boot').TiddlyWiki();
  tw.boot.argv = ['.'];
  tw.boot.boot();
  // Load plugin folder
  let pluginInfo = tw.loadPluginFolder(SOURCE, undefined);
  // Output json file
  mkdirsSync(path.dirname(OUTPUT));
  fs.writeFileSync(OUTPUT, JSON.stringify(pluginInfo));
} catch (error) {
  core.setFailed(error.message);
}
