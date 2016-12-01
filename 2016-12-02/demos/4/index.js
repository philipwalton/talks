import postcss from 'postcss';
import getPageStyles from './get-page-styles';

getPageStyles()
  .then((css) => postcss.parse(css))
  .then((ast) => {
    console.log(simplify(ast.toJSON()));
  });


// Removes `raws` and `source` properties to prevent distractions,
// since they're not mentioned in the demo.
const simplify = (node) => {
  delete node.raws;
  delete node.source;
  if (node.nodes) {
    node.nodes.forEach(simplify);
  }
  return node;
}
