const core = require("@actions/core");
const { mkdirsSync, packPlugin } = require("./packup");

try {
  // Parse params
  const SOURCE = core.getMultilineInput("source");
  let OUTPUT = core.getInput("output");
  const MINIFY = core.getInput("minify") === "true";
  const UGLIFYJS_OPTIONS = core.getInput("uglifyjs-options");
  const CLEANCSS_OPTIONS = core.getInput("cleancss-options");
  let UglifyJSOption, CleanCSSOptions;
  try {
    UglifyJSOption = JSON.parse(UGLIFYJS_OPTIONS);
  } catch (e) {}
  try {
    CleanCSSOptions = JSON.parse(CLEANCSS_OPTIONS);
  } catch (e) {}
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
  if (OUTPUT === undefined) OUTPUT = "output";
  console.log("Checking options:");
  console.log(` - Minify: ${MINIFY}`);
  console.log(` - Output: ${OUTPUT}`);
  console.log(" - Input:");
  SOURCE.forEach((plugin_source) => {
    console.log(`   - ${plugin_source}`);
  });
  console.log(" - UglifyJSOption:");
  console.log(UglifyJSOption);
  console.log(" - CleanCSSOptions:");
  console.log(CleanCSSOptions);
  // Make output directory
  console.log("Creating output directory.");
  if (mkdirsSync(OUTPUT) === false)
    throw new Error(`Failed to create directory ${OUTPUT}.`);
  // Load plugin folders
  const successPlugins = [];
  console.log(`Start packing up ${SOURCE.length} plugins:`);
  SOURCE.forEach((plugin_source) => {
    console.log(` - Packing up plugin ${plugin_source}.`);
    let filePath = packPlugin(
      plugin_source,
      OUTPUT,
      UglifyJSOption,
      CleanCSSOptions,
      MINIFY,
      true
    );
    successPlugins.push(filePath);
  });
  core.setOutput("output-plugins", successPlugins);
  console.log(`Successfully packed ${successPlugins.length} plugins.`);
} catch (error) {
  console.error(error);
  core.setFailed(error.message);
}
