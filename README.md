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

Alternatively, use the [template](https://github.com/gustavgb/html-bricks-template) to get started.

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

Also, take a look at the [documentation](https://gustavgb.github.io/html-bricks) to learn more.

## License

This project is licensed under the MIT license.
