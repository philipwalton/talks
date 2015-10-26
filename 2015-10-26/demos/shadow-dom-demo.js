// INSTRUCTIONS: Load this file from shadow-dom-demo.html to see it in action.

// Grabs a reference to the <p> already on the page.
var p1 = document.querySelector('p');

// Creates a new <p> element and adds it to the document.
var p2 = document.createElement('p');
document.body.appendChild(p2);

// Creates a shadow root on p1 and sets its contents to the same
// as the regular HTML contents of p1.
p2.createShadowRoot();
p2.shadowRoot.innerHTML = p1.innerHTML;

// Adds a <style> element to p2's shadow root.
// Notice how the styles from the main document don't affect the shadow
// contents, and the shadow styles don't affect the main document.
var style = document.createElement('style');
style.innerHTML = '.fancy { color: blue; font-style: italic; }';
p2.shadowRoot.appendChild(style);
