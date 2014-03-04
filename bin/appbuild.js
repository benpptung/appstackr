#!/usr/bin/env node

var commander = require('commander'),
    appstack = require('../index'),
    meta = require('../package.json');

var options;

commander
.version(meta.version)
.usage('[options]')
.option('-M, --no-view-minify', 'do not minify view, inline js and css')
.option('-j, --inline-js-minify', 'inline javascript minify')
.option('-C, --no-inline-css-minify', 'do not minify inline css')
.option('-q, --quiet', 'be quiet in warning messages')
.description('Build distribution files with verison control hash tag and CDN url')
.parse(process.argv);

options = {};
if (commander.viewMinify === false) options.viewMini = false;
if (commander.hasOwnProperty('inlineJsMinify')) options.viewJsMini = true;
if (commander.hasOwnProperty('quiet')) options.warning = false;
if (commander.inlineCssMinify === false) options.viewCSSMini = false;



appstack.build(options);