# html-bricks

The easiest way to compile modularized html files into flat html files 😊

Take a look at the [documentation](https://gustavgb.github.io/html-bricks) or clone the [template repository](https://github.com/gustavgb/html-bricks-template) to get started.

## Installation

`npm install --save-dev html-bricks`

## Example

If you have multiple HTML pages and want to share certain parts of the markup between pages, you can do so very simply with `html-bricks`.

A nav bar might look like this

```html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
<nav>
```

And you might need it inside your index.html

> Assume that the navigation module is placed at *src/navigation.module.html*

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My awesome site!</title>
  </head>
  <body>
    <module>navigation.html</module>
  </body>
</html>
```

Intuitively, this would give you

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

## License

This project is licensed under the MIT license.
