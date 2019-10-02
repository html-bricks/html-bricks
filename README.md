# html-bricks

The easiest way to compile modularized html files into flat html files 😊

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

Alternatively, use the [template](https://github/com/gustavgb/html-bricks-template) to get started.

## Usage

Say you have a file `src/index.html` which looks like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My awesome site!</title>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    <nav>
  </body>
</html>
```

That's great! An index with a head and a nav bar. But say you wanted to have multiple pages that all shared the same nav bar and head. With `html-bricks` this is easy!

You just need to add a few **bricks**:

*src/navigation.module.html*
```html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
<nav>
```

*src/head.module.html*
```html
<head>
  <title>My awesome site!</title>
</head>
```

*src/index.html*
```html
<!DOCTYPE html>
<html>
  <module>head.html</module>
  <body>
    <module>navigation.html</module>
  </body>
</html>
```

Easy right? Take a look at the [template](https://github/com/gustavgb/html-bricks-template) to get started.

## A few rules

1. All files are placed within the source directory.
2. Modules end with `.module.html`.
3. Modules are imported with their relative path (from src), but without the `module.` section.
   - For example `src/modules/footer.module.html` becomes `modules/footer.html`.
4. Only html files that are not modules will be compiled. So nested modules are not supported.
5. All other file types are copied into the build directory.

## Configuration

If you want to configure the source dir and/or build dir, you can do so by adding a `config.json` at the root of your project folder.

The default configuration is:

```json
{
  "sourceDir": "src",
  "buildDir": "build"
}
```

## License

This project is licensed under the MIT license.
