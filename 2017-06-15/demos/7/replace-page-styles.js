export const replacePageStyles = (css) => {
  // Get a reference to all existing style elements.
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');

  // Create a new <style> tag with all the polyfilled styles.
  const polyfillStyles = document.createElement('style');
  polyfillStyles.innerHTML = css;
  document.head.appendChild(polyfillStyles);

  // Remove the old styles once the new styles have been added.
  styles.forEach((el) => el.parentElement.removeChild(el));
};
