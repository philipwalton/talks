const getPageStyles = () => {
  // Query the document for any element that could have styles.
  var styleElements =
      [...document.querySelectorAll('style, link[rel="stylesheet"]')];

  // Fetch all styles and ensure the results are in document order.
  // Resolve with a single string of CSS text.
  return Promise.all(styleElements.map((el) => {
    if (el.href) {
      return fetch(el.href).then((response) => response.text());
    } else {
      return el.innerText;
    }
  })).then((stylesArray) => stylesArray.join('\n'));
};

export default getPageStyles;
