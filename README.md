# tw5-plugin-packer action

![](https://img.shields.io/badge/Version-v0.0.1-green) [https://img.shields.io/badge/Join-TW5CPL-yellow](https://github.com/tiddly-gittly/TiddlyWiki-CPL)

Don't know how to use automated build tools? Only know how to put plugins into HTML files? Have to manually export JSON files to publish to Release pages every time? If you are in the same boat, try this Action!

The `tw5-plugin-packer` will package the TiddlyWiki5 plugin folder you wrote into a separate JSON file. This is the recommended and easy to distribute and update plugin format. Users simply drag the JSON file into the Wiki window to install the plugin. The same Action applies to plugins in formats such as themes, language packs, etc.!

不会使用自动构建工具？只会把插件放到 HTML 文件里？每次都要手动导出 JSON 文件发布到 Release 页面？如果你也是这样，请试试这个 Action 吧！

`tw5-plugin-packer`会将你编写的 TiddlyWiki5 插件文件夹打包成一个独立的 JSON 文件。这是一种推荐的、易于分发和更新的插件格式，使用者只需将 JSON 文件拖入 Wiki 窗口即可安装插件。对于主题、语言包等格式的插件也同样适用此 Action！

## Inputs 输入参数

### `source`

**Required(必填)** The root directory of your plugin, i.e. the directory that includes the `plugin.info` file, defaults to `src`. 你的插件的根目录，即包括 `plugin.info` 文件的目录，默认为 `src`。

### `output`

**Required(必填)** The path of the packed plugin file, default to `output/plugin.json`. 打包的插件文件的路径，默认为 `output/plugin.json`。

## Example usage

```yaml
- uses: tiddly-gittly/tw5-plugin-packer@v0.0.1
  with:
    source: 'src'
    output: 'dist/plugin.json'
```
