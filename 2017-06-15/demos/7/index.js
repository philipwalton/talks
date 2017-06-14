import postcss from 'postcss';
import {randomFunctionPlugin} from './random-function-plugin.js';
import {getPageStyles} from './get-page-styles.js';
import {replacePageStyles} from './replace-page-styles.js';

getPageStyles()
  .then((css) => postcss([randomFunctionPlugin]).process(css))
  .then((result) => replacePageStyles(result.css));
