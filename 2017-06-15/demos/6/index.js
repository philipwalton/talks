import postcss from 'postcss';
import {getPageStyles} from './get-page-styles.js';
import {replacePageStyles} from './replace-page-styles.js';

const randomFunctionPlugin = postcss.plugin('random-function', () => {
  return (css) => {
    css.walkRules((rule) => {
      rule.walkDecls((decl, i) => {
        if (decl.value.includes('random()')) {
          const elements = document.querySelectorAll(rule.selector);
          for (const element of elements) {
            element.style[decl.prop] =
                decl.value.replace('random()', Math.random());
          }
        }
      });
    });
  };
});

getPageStyles()
  .then((css) => postcss([randomFunctionPlugin]).process(css))
  .then((result) => replacePageStyles(result.css));
