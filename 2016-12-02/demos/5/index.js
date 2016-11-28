import postcss from 'postcss';
import getPageStyles from '../src/get-page-styles';
import replacePageStyles from '../src/replace-page-styles';

const randomKeywordPlugin = postcss.plugin('random-keyword', () => {
  return (css) => {
    css.walkRules((rule) => {
      rule.walkDecls((decl, i) => {
        if (decl.value.includes('random')) {
          decl.value = decl.value.replace('random', Math.random());
        }
      });
    });
  };
});

getPageStyles()
  .then((css) => postcss([randomKeywordPlugin]).process(css))
  .then((result) => replacePageStyles(result.css));
