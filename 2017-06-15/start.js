require('shelljs/global');

const connect = require('connect');
const fs = require('fs');
const glob = require('glob');
const serveStatic = require('serve-static');


const entries = glob.sync('demos/[1-9]/index.js');

fs.watch('demos', {recursive: true}, (eventType, filename) => {
  if (!filename.match(/bundle\.js$/)) {
    console.log('Change detected, rebuilding source files...');
    buildSources();
  }
});

const buildSources = () => {
  for (const entry of entries) {
    const browserify = 'node_modules/.bin/browserify';
    const babelify = 'babelify --presets [ stage-2 es2015 ]';
    const output = entry.replace(/\.js$/, '.bundle.js');

    exec(`${browserify} ${entry} -t [ ${babelify} ] | uglifyjs > ${output}`,
        () => console.log(`Compiled: ${entry}`));
  }
}

buildSources(entries);

console.log('Server started on on port 8080');
connect().use(serveStatic('./')).listen(8080);
