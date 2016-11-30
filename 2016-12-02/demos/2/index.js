for (const stylesheet of document.styleSheets) {
  // Flatten nested rules (@media blocks, etc.) into a single array.
  const rules = [...stylesheet.rules].reduce((prev, next) => {
    return prev.concat(next.cssRules ? [...next.cssRules] : [next]);
  }, []);

  for (const rule of rules) {
    for (const property of Object.keys(rule.style)) {
      const value = rule.style[property];

      if (value.includes('random')) {
        rule.style[property] = value.replace('random', Math.random());
      }
    }
  }
}
