The Dark Side of Polyfilling CSS:
Secrets polyfill authors won't tell you.
========================================

## CSS Houdini

Developers understand that what, but not the way.

Many developers haven't experienced the pain first-hand.

> I use CSS polyfills today and they work just fine

## But do CSS polyfills work just fine?

The answer is no, but to understand why, let's build a CSS polyfill together

## Introducing the `random` keyword

`random` is a hypothetical new CSS keyword that resolves to a number between 0 and 1, exactly like `Math.random()` does in JavaScript:

Usage:

```css
div {
  width: calc(random * 100%);
}
```

## How do polyfills work?

All polyfills and transpilers fundamentally do the same thing. They take code the browser *doesn't* understand and turn it into code the browser *does* understand.

But before they do anything, they first check to see if the current browser supports the given feature.

### Feature detection

```js
// Create a test element and apply some styles
// to it that use the feature in question.
const testElement = document.createElement('div');
testElement.setAttribute('style', 'width: calc(random * 100%)');

// Read back those styles to see if the browser recognized them.
console.log(testElement.style.width); // Logs '';
```

### The CSS Object Model

The CSS Object Model ignores rules it doesn't understand

This is both great and terrible.
- It's great because it allows you to use features before they're supported in all browsers
- It's terrible because it means if you want to query the CSS for the presence of a feature (.e.g `random`) you have to make additional requests to fetch the raw CSS text yourself.

    List of things the browser already does for us, but because developers don't have hooks into that process, we have to do it entirely on our own
    [x] Fetching the CSS


## Fetching the CSS

```js
const getCSS = () => {
  // Query the document for any element that could have
  var styleElements = [...document.querySelectorAll(
      'style, link[rel="stylesheet"]')];

  // Fetch all styles and ensure the results are in document order.
  return Promise.all(styleElements.map((el) => {
    if (el.href) {
      return fetch(el.href).then((response) => response.text());
    } else {
      return el.innerText;
    }
  })).then((stylesArray) => stylesArray.join('\n'));
};

// Gets all styles on the page and logs them.
getCSS().then((css) => console.log(css));
```

## Examining the CSS for the presence of our feature

Famous Last Words:

> CSS is pretty simple, I bet I could parse it with a regular expression

Unfortunately, I don't have time to go into all the gruesome details of why this is a terrible idea, but I'll leave you with just a few of the more obvious gotchas.

```css
a[href*="random"] {
  background: url('random.png');
  color: var(--random);
}
a::after {
  content: "random";
}
```

    List of things the browser already does for us, but because developers don't have hooks into that process, we have to do it entirely on our own
    [x] Fetching the CSS
    [x] Parsing the CSS

### Parsing the CSS

```
const postcss = require('postcss');

getCSS().then((css) => posecss.parse(css));
```


Turns this:

```css
div {
  width: calc(random * 100%);
}
```

into this:

```json
{
  "type": "root",
  "nodes": [
    {
      "type": "rule",
      "selector": "div",
      "nodes": [
        {
          "type": "decl",
          "prop": "width",
          "value": "calc(random * 100%)"
        }
      ]
    }
  ]
}
```
















## Gotchas

- This only works for same-origin or CORS-enabled stylesheets
- If the DOM changes, the entire CSS AST needs to be regenerated
- Every time you update the CSS you force the browser to
  - reparse the new CSS
  - regenerate the CSSOM
  - Re-layout the page
  - Repaint the page
  - Recomposite
- If your polyfill will need to update the page often, it will be a performance nightmare

##









