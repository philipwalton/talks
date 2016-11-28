import postcss from 'postcss';

let uid = 0;

export default postcss.plugin('random-keyword', (options) => {
  return (css) => {
    css.walkRules((rule) => {
      const newRules = {};
      rule.walkDecls((decl, i) => {
        if (decl.value.match('random')) {
          for (const el of document.querySelectorAll(rule.selector)) {
            const pid = el.dataset.pid || (el.dataset.pid = uid++);
            const newRule = newRules[pid] || (newRules[pid] = rule.clone({
              selector: appendToSelector(rule.selector, `[data-pid="${pid}"]`),
              nodes: [],
            }));

            newRule.nodes.push(decl.clone({
              value: decl.value.replace('random', Math.random()),
            }));
          }
          decl.remove();
        }
      });

      // Clone the current rule and update the selector.
      rule.parent.insertBefore(rule, rule.clone({
        selector: appendToSelector(rule.selector, ':not(.z)')
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


const appendToSelector = (selector, addition) => {
  return selector
    .split(/\s*,\s*/)
    .map((s) => s + addition)
    .join(',');
};
