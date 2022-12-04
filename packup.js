const path = require("path");
const fs = require("fs");
const UglifyJS = require("uglify-es");
const CleanCSS = new require("clean-css");

exports.mkdirsSync = function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) return true;
  mkdirsSync(path.dirname(dirname));
  return fs.mkdirSync(dirname);
}

let $tw;

exports.packPlugin = function packPlugin(
  pluginFolderPath,
  output,
  UglifyJSOption = undefined,
  CleanCSSOptions = undefined,
  minify = false,
  show_log = false
) {
  if (exports.mkdirsSync(output) === false)
    throw new Error(`Failed to create directory ${output}.`);
  if (UglifyJSOption === undefined)
    UglifyJSOption = {
      warnings: false,
      ie8: true,
      safari10: true,
    };
  if (CleanCSSOptions === undefined)
    CleanCSSOptions = {
      compatibility: "ie8",
      level: 2,
    };
  // Boot tw5
  if (show_log) console.log("Booting up tiddlywiki core.");
  if (!$tw) {
    $tw = require("tiddlywiki/boot/boot").TiddlyWiki();
    $tw.boot.argv = ["."];
    $tw.boot.boot();
  }
  const pluginInfo = $tw.loadPluginFolder(pluginFolderPath, undefined);
  if (
    !pluginInfo ||
    typeof pluginInfo.title !== "string" ||
    pluginInfo.title === ""
  ) {
    if (show_log)
      console.log(
        `   - Plugin is unavailable, dose it exist and has a plugin.info file?`
      );
    return;
  }
  if (show_log) console.log(`   - Plugin name is ${pluginInfo.title}.`);
  // Minify tiddlers
  if (minify) {
    const tiddlersJson = JSON.parse(pluginInfo.text);
    const tiddlers = Object.keys(tiddlersJson.tiddlers);
    const len = tiddlers.length;
    for (let i = 0; i < len; i++) {
      const tiddler = tiddlersJson.tiddlers[tiddlers[i]];
      try {
        if (tiddler.type === "application/javascript") {
          if (show_log)
            console.log(`   - Try minifying JS tiddler ${tiddlers[i]}.`);
          const minified = UglifyJS.minify(tiddler.text, UglifyJSOption).code;
          if (minified !== undefined) tiddler.text = minified;
        } else if (tiddler.type === "text/css") {
          if (show_log)
            console.log(`   - Try minifying CSS tiddler ${tiddlers[i]}.`);
          const minified = new CleanCSS(CleanCSSOptions).minify(
            tiddler.text
          ).styles;
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
  if (show_log) console.log(`   - Saving plugin ${pluginInfo.title}.`);
  const fileName =
    path.basename($tw.utils.generateTiddlerFilepath(pluginInfo.title, {})) +
    ".json";
  const filePath = path.join(output, fileName);
  if (pluginInfo["plugin-type"] === "theme") {
    // theme only need tiddlers content, other things will use meta file instead
    fs.writeFileSync(filePath, JSON.stringify(tiddlersJson));
  } else {
    fs.writeFileSync(filePath, JSON.stringify(pluginInfo));
  }
  if (show_log)
    console.log(
      `   - Plugin ${pluginInfo.title} has been saved to ${filePath}.`
    );
  return filePath;
};
