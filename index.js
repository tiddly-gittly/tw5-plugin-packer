const { packPlugin } = require("./packup");
const fs = require("fs");
const minimist = require("minimist");
const argv = minimist(process.argv.slice(2));

function defaultValue() {
  const len = arguments.length;
  for (let i = 0; i < len; i++) {
    if (arguments[i]) return arguments[i];
  }
}

const pluginFolderPath = defaultValue(argv.i, argv.input, "");
const outputPath = defaultValue(argv.o, argv.output, argv.dist, "output");
const minify = defaultValue(argv.minify, "true") === "true";
const showLog = defaultValue(argv.log, "false") === "true";
let showHelp = defaultValue(argv.h, argv.help, "false") === "true";

if ((!showHelp && !pluginFolderPath) || pluginFolderPath === "") {
  console.log("You should specify the plugin folder!");
  showHelp = true;
}
if (!showHelp && !fs.statSync(pluginFolderPath).isDirectory()) {
  console.log(
    `${pluginFolderPath ? pluginFolderPath : "[null]"} is not a folder!`
  );
  showHelp = true;
}

if (showHelp) {
  console.log(
    `Usage: tw5-plugin-packer -i/--input [Plugin Folder] -o/--output/--dist [Output Folder]
All arguments:
  * -i/--input: The root folder of your plugin. plugins/My/Plugin1 etc.
  * -o/--output/--dist: The output path of the packed plugin files, default to "output"
  * --minify: Wheter to minify js and css tiddlers, default to "true"
  * --log: Print out logs, default to "false"
  * --help: Show this help`.trim()
  );
} else {
  packPlugin(
    pluginFolderPath,
    outputPath,
    minify,
    undefined,
    undefined,
    showLog
  );
}
