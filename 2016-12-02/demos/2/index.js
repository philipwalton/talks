for (const stylesheet of document.styleSheets) {
  const rules = [...stylesheet.rules].reduce((prev, next) => {
    return prev.concat(next.cssRules ? [...next.cssRules] : [next]);
  }, []); // Flattens nested rules into a single array.

  for (const rule of rules) {
    for (const property of Object.keys(rule.style)) {
      const value = rule.style[property];

      if (value.includes('random')) {
        rule.style[property] = value.replace('random', Math.random());
      }
    }
  }
}
