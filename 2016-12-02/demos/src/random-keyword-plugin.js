import postcss from 'postcss';


let uid = 0;
const randomRegex = /--[\w\-]+|"[^"]+"|'[^']+'|url\([^\(]*\)|(random)/g;
const selectorRegex = /\[[^\]]+\]|(,)/g;


export default postcss.plugin('random-keyword', (options) => {
  return (css) => {
    css.walkRules((rule) => {
      const newRules = {};
      rule.walkDecls((decl, i) => {
        if (includesRandomKeyword(decl.value)) {
          for (const el of document.querySelectorAll(rule.selector)) {
            const pid = el.dataset.pid || (el.dataset.pid = uid++);
            const newRule = newRules[pid] || (newRules[pid] = rule.clone({
              selector: appendToSelectors(rule.selector, `[data-pid="${pid}"]`),
              nodes: [],
            }));

            newRule.nodes.push(decl.clone({
              value: resolveRandomKeywords(decl.value),
            }));
          }
          decl.remove();
        }
      });

      // Clone the current rule and update the selector.
      rule.parent.insertBefore(rule, rule.clone({
        selector: appendToSelectors(rule.selector, ':not(.z)')
      }))

      // Insert all the new rules before the current rule.
      for (const id of Object.keys(newRules)) {
        rule.parent.insertBefore(rule, newRules[id]);
      }

      // Remove the current rule and continue iterating.
      rule.remove();
    });
  };
});


const appendToSelectors = (selector, addition) => {
  const selectors = [];
  let startIndex = 0;
  let matches;
  while (matches = selectorRegex.exec(selector)) {
    if (matches[1]) {
      const endIndex = selectorRegex.lastIndex;
      selectors.push(selector.slice(startIndex, endIndex - 1).trim());
      startIndex = endIndex;
    }
  }
  selectors.push(selector.slice(startIndex).trim());

  return selectors
    .map((s) => s + addition)
    .join(', ');
};


const includesRandomKeyword = (str) => {
  let matches;
  while (matches = randomRegex.exec(str)) {
    if (matches[1]) return true;
  }
}


const resolveRandomKeywords = (str) => {
  return str.replace(randomRegex, (match, p1) => {
    return p1 ? Math.random() : match;
  });
}
