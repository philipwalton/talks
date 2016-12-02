import postcss from 'postcss';
import randomKeywordPlugin from './random-keyword-plugin';
import getPageStyles from './get-page-styles';
import replacePageStyles from './replace-page-styles';

getPageStyles()
  .then((css) => postcss([randomKeywordPlugin]).process(css))
  .then((result) => replacePageStyles(result.css));
