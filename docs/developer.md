# Developer documentation

Extending `html-bricks` is done through plugins.

Looking for the [user documentation](https://gustavgb.github.io/html-bricks)?

## Creating a plugin

Create a npm module as you would normally do. To test the plugin in a project, use `npm link`.

Plugins are API based (similar to Gatsby) so even though currently plugin can only alter files post-build, this could change in the future and your plugin would work with never versions of `html-bricks`.

### exports.postBuild

Export this function to alter files post-build.

```js
exports.postBuild = function postBuild (files) {
  return new Promise(function (resolve, reject) {
    /* Do something with the files */

    /* Resolve the new version of the files */
    resolve(files)
  })
}
```

> Note: The postBuild function must return a promise, and that promise should return a new list of files. Files not included in the result will not be written to disk.

Files is an array of the following model

```js
{
  src: String, // Where is the file coming from
  dest: String, // Where will the file go
  content: Buffer // Buffer containing the file contents that will be written
}
```

You alter files by altering these three properties and returning the new array of files.

> Note: It is recommended to copy the files array to avoid unexpected side effects.

## Publishing your plugin

When publishing your module, it is required to prefix its name with `html-bricks-`. Otherwise the compiler will not understand what to look for.

For example name your plugin `html-bricks-plugin-awesome` and import it with

```json
{
  "plugins": [
    "plugin-awesome"
  ]
}
```

## Plugins ideas

What could you do with plugins? Here are some ideas

### CMS source plugin

A plugin that loads content from a headless CMS and replaces template tags with actual content.

### Translation plugin

A plugin that automatically translates content to other predefined locales and builds each locale under *build/{locale}/*.

### PostCSS plugin

A plugin that automatically transpile all CSS files to cross browser supported styling.

### Inline css plugin

A plugin that pastes all css styling inside each HTML file's head to prevent FOUC.

### Uglify plugin

A plugin that uglifies the html/css/js files to reduce file size.

### Babel plugin

A plugin that uses Babel to transpile js files to ES5 compliant code.
