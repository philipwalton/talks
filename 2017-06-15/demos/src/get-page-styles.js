export const getPageStyles = () => {
  // Query the document for any element that could have styles.
  var styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')];

  // Fetch all styles and ensure the results are in document order.
  // Resolve with a single string of CSS text.
  return Promise.all(styles.map((el) => {
    if (el.href) {
      return fetch(el.href).then((response) => response.text());
    } else {
      return el.innerText;
    }
  })).then((stylesArray) => stylesArray.join('\n'));
};
