# Documentation

This page is a simple documentation for how to use [html-bricks](https://github.com/gustavgb/html-bricks). Installation guides are found in the repository's [README](https://github.com/gustavgb/html-bricks#readme).

## Files

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
  "buildDir": "build"
}
```
