import postcss from 'postcss';
import randomKeywordPlugin from '../src/random-keyword-plugin';
import getPageStyles from '../src/get-page-styles';
import replacePageStyles from '../src/replace-page-styles';

getPageStyles()
  .then((css) => postcss([randomKeywordPlugin]).process(css))
  .then((result) => replacePageStyles(result.css));
