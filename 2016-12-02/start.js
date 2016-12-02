const babelify = require('babelify');
const browserify = require('browserify');
const connect = require('connect');
const fs = require('fs');
const glob = require('glob');
const serveStatic = require('serve-static');

const entries = glob.sync('demos/[1-9]/index.js');

fs.watch('demos', {recursive: true}, (eventType, filename) => {
  if (!filename.match(/bundle\.js$/)) buildSources();
});

const buildSources = () => {
  for (const entry of entries) {
    console.log(`Compiling ${entry}`);
    browserify(entry, {debug: true}).transform(babelify, {
      presets: ['es2015', 'stage-2']
    })
    .bundle()
    .pipe(fs.createWriteStream(entry.replace(/\.js$/, '.bundle.js')));
  }
}

buildSources(entries);

console.log('Server started on on port 8080');
connect().use(serveStatic('./')).listen(8080);
