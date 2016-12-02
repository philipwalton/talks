bin := ./node_modules/.bin

all: browserify

browserify:
	@ $(bin)/browserify demos/src/parse.js > demos/build/parse.js
	@ $(bin)/browserify demos/src/plugin.js > demos/build/plugin.js
	@ $(bin)/browserify demos/src/final.js > demos/build/final.js

start:
	@ server 8080

.PHONY: all browserify