# Documentation

Using [html-bricks](https://github.com/gustavgb/html-bricks) is very easy but allows you to customize the setup to your preferences.

The point of this project is to provide a simple way to modularize html files without building a space ship. Sometimes, all you need is a few *bricks* 🧱

## Installation

Install the package

`npm install --save-dev html-bricks`

Then in your scripts, add

```json
{
  "scripts": {
    "build": "html-bricks"
  }
}
```

Optionally use `--watch` to enable file watching and live rebuilding.

Alternatively, use the [template](https://github.com/gustavgb/html-bricks-template) to get started.


## Setup

All files must be placed inside the source directory (default *src/*), whether they are modules, stylesheets or other assets.

Everything (except for modules) is copied from the source directory to the build directory at compile time and folders are preserved.

This means that you create routes the same way you would normally do - by placing .html files in sub folders.

## Declaring modules

Declare a module by renaming it to `filename.module.html` instead of `filename.html`.

A module is allowed to declare a custom head tag, which will be inserted into the parent's head tag, by doing this:

```html
<module:head>
  <link rel="stylesheet" href="/module-styles.css">
</module:head>
```

> You don't actually need to import styles, this is just an example.

## Importing modules

Modules are imported by using their path relative to the source directory. So a module at

```
src/folder/sub-folder/my-module.module.html
```

can be imported with

```html
<module>folder/sub-folder/my-module.html</module>
```

> Notice that `.module.html` becomes `.html` when importing modules.

> If the module declares a custom header, this will be inserted into the parent's head. If the same custom head tag is imported multiple times (for what ever reason) it is **not** duplicated.

**Nested modules?**

Modules are not compiled so nested modules are not supported. They might be in the future though.

## Configuration

If you want to configure the source dir and/or build dir, you can do so by adding a `config.json` at the root of your project folder.

The default configuration is:

```json
{
  "sourceDir": "src",
  "buildDir": "build",
  "plugins": []
}
```

## Plugins

It is possible to extend `html-bricks` with plugins, if you need a more advanced setup. However, this is not necessary.

To enable plugins, you need to have a [configuration](#configuration) in your project. Use the `plugins` property to include plugins. The plugins are run in series from top to bottom.

**Example**

```json
{
  "plugins": [
    "plugin-sass"
  ]
}
```

This would include the plugin `html-bricks-plugin-sass`. Make sure it is installed in your project folder.

> Notice the exclusion is `html-bricks-` in the plugin declaration. This part is optional, so you can include it or not depending on your preference.

To create your own plugin, see the [developer documentation](developer).
