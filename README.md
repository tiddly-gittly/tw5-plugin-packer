# tw5-plugin-packer action

[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/tiddly-gittly/tw5-plugin-packer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/tiddly-gittly/tw5-plugin-packer/context:javascript) [![](https://img.shields.io/badge/Version-v0.0.10)](https://github.com/tiddly-gittly/tw5-plugin-packer/releases/tag/v0.0.10) [![](https://img.shields.io/badge/Join-TW5CPL-yellow)](https://github.com/tiddly-gittly/TiddlyWiki-CPL)

Don't know how to use automated build tools? Only know how to put plugins into HTML files? Have to manually export JSON files to publish to Release pages every time? If you are in the same boat, try this Action!

`tw5-plugin-packer` can also be used as an npm library or API. Install `tw5-plugin-packer` globally using npm/yarn/pnpm, etc., and then type the `tw5-plugin-packer` command to view the documentation.

The `tw5-plugin-packer` will package the TiddlyWiki5 plugin folders you wrote into separate JSON files. This is the recommended and easy to distribute and update plugin format. Users simply drag the JSON file into the Wiki window to install the plugin. The same Action applies to plugins in formats such as themes, language packs, etc.!

不会使用自动构建工具？只会把插件放到 HTML 文件里？每次都要手动导出 JSON 文件发布到 Release 页面？如果你也是这样，请试试这个 Action 吧！

`tw5-plugin-packer`同时也可以作为npm库或者API使用，使用npm/yarn/pnpm等全局安装`tw5-plugin-packer`，再打出`tw5-plugin-packer`命令来查看文档。

`tw5-plugin-packer`会将你编写的 TiddlyWiki5 插件文件夹打包成独立的 JSON 文件。这是一种推荐的、易于分发和更新的插件格式，使用者只需将 JSON 文件拖入 Wiki 窗口即可安装插件。对于主题、语言包等格式的插件也同样适用此 Action！

## Inputs 输入参数

### `source`

**Required(必填)** The root directory of your plugin. You can add multiple paths in the form of one per line, and **not to add quotation marks to each line**! 你的插件的根目录。你可以以每行一个的形式添加多个路径，**注意每行不要加引号**！

### `output`

**Optional(选填)** The output path of the packed plugin files, default to `output`. 打包的插件文件的输出路径，默认为 `output` 。

> #### Note 注意
>
> For packaged plugins, the same naming scheme as in TiddlyWiki5 for tiddler will be used. For example, for a plugin called `$:/plugins/foo/bar`, the packaged file name will be `$__plugins_foo_bar.json`.
>
> 对于打包后的插件，将使用和 TiddlyWiki5 中对 tiddler 一样的命名方法。例如对于一个叫 `$:/plugins/foo/bar` 的插件，其打包后的文件名为 `$__plugins_foo_bar.json` 。

### `minify`

**Optional(选填)** Wheter to minify js and css tiddlers, default to `true`. 是否对 js 和 css 条目进行最小化处理，默认为`true`。

- Use [UglifyJS](https://github.com/mishoo/UglifyJS/tree/harmony#minify-options) to compress JS tiddlers. Use [CleanCSS](https://github.com/clean-css/clean-css#use) to compress CSS tiddlers.
- 使用 [UglifyJS](https://github.com/mishoo/UglifyJS/tree/harmony#minify-options) 对 JS 条目进行压缩。使用 [CleanCSS](https://github.com/clean-css/clean-css#use) 对 CSS 条目进行压缩。

### `uglifyjs-options`

**Optional(选填)** JSON string of options for UglifyJS. UglifyJS 的选项的 JSON 字符串。

Default Value 默认值：

```json
{
  "warnings": false,
  "ie8": true,
  "safari10": true
}
```

### `cleancss-options`

**Optional(选填)** JSON string of options for CleanCSS. CleanCSS 的选项的 JSON 字符串。

Default Value 默认值：

```json
{
  "compatibility": "ie8",
  "level": 2
}
```

## Outputs 输出

### `output-plugins`

The JSON file path of the successfully exported plugin, stored as an array of strings in JSON format.

成功导出的插件的 JSON 文件路径，用 JSON 格式的字符串数组储存。

## Example usage 使用样例

In the simplest case, pack one plugin at a time 最简单的情况，一次只打包一个插件：

```yaml
# It's necessary to use checkout action to fetch your repo, or action cannot find your plugin files!
# 需要使用checkout action来获取项目，否则无法找到你的插件文件！
- uses: actions/checkout@v2
- uses: tiddly-gittly/tw5-plugin-packer@v0.0.10
  with:
    source: "src"
    output: "dist"
```

You can also package multiple plugins at once 也可以一次打包多个插件：

```yaml
# It's necessary to use checkout action to fetch your repo, or action cannot find your plugin files!
# 需要使用checkout action来获取项目，否则无法找到你的插件文件！
- uses: actions/checkout@v2
- uses: tiddly-gittly/tw5-plugin-packer@v0.0.10
  with:
    source: |
      src1
      src2
      src3
    output: "dist"
```

## GitHub Action Template 模板

With the tag added (using `git tag`), build the plugin located in `plugins/My/Plugin` and upload it to Release.

在添加tag的前提下(使用`git tag`)，构建位于`plugins/My/Plugin`的插件，并将其上传到Release：

```yaml
name: Publish my plugin

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: tiddly-gittly/tw5-plugin-packer@v0.0.10
        with:
            source: "plugins/My/Plugin"
            output: "output"
      - name: Upload to release
        uses: svenstaro/upload-release-action@v2
        with:
            repo_token: ${{ secrets.GITHUB_TOKEN }}
            file: output/*.json
            tag: ${{ env.RELEASE_VERSION }}
            overwrite: true
            file_glob: true
