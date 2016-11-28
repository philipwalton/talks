import postcss from 'postcss';
import getPageStyles from '../src/get-page-styles';

getPageStyles()
  .then((css) => postcss.parse(css))
  .then((ast) => console.log(ast));
