import postcss from 'postcss';


let uid = 0;
const randomRegex = /--[\w\-]+|"[^"]+"|'[^']+'|url\([^\(]*\)|(random\(\))/g;
const selectorRegex = /\[[^\]]+\]|(,)/g;
const pseudoElementsRegex =
    /(:(?:before|after|first-letter|first-line)|::[a-z\-]+)$/;


export const randomFunctionPlugin = postcss.plugin('random-function',
    (options) => {
  return (css) => {
    css.walkRules((rule) => {
      const newRules = {};
      rule.walkDecls((decl, i) => {
        if (includesRandomFunction(decl.value)) {
          for (const el of document.querySelectorAll(rule.selector)) {
            const pid = el.dataset.pid || (el.dataset.pid = uid++);
            const newRule = newRules[pid] || (newRules[pid] = rule.clone({
              selector: appendToSelectors(rule.selector, `[data-pid="${pid}"]`),
              nodes: [],
            }));

            newRule.nodes.push(decl.clone({
              value: resolveRandomFunctions(decl.value),
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


const appendToSelectors = (selectors, addition) => {
  const parts = [];
  let startIndex = 0;
  let matches;
  while (matches = selectorRegex.exec(selectors)) {
    if (matches[1]) {
      const endIndex = selectorRegex.lastIndex;
      parts.push(selectors.slice(startIndex, endIndex - 1).trim());
      startIndex = endIndex;
    }
  }
  parts.push(selectors.slice(startIndex).trim());

  return parts
    .map((selector) => appendToSelector(selector, addition))
    .join(', ');
};


const appendToSelector = (selector, addition) => {
  if (pseudoElementsRegex.test(selector)) {
    return selector.replace(pseudoElementsRegex, `${addition}$1`);
  } else {
    return selector + addition;
  }
};


const includesRandomFunction = (str) => {
  let matches;
  while (matches = randomRegex.exec(str)) {
    if (matches[1]) return true;
  }
};


const resolveRandomFunctions = (str) => {
  return str.replace(randomRegex, (match, p1) => {
    return p1 ? Math.random() : match;
  });
};
