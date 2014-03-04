#!/usr/bin/env node

var commander = require('commander'),
    appstack = require('../index'),
    meta = require('../package.json');

var options = {};

commander
.version(meta.version)
.usage('[options]')
.option('-b, --beautify', 'beautify codes')
.option('-q, --quiet', 'be quiet in warning messages')
.option('-f, --filter [filter]', 'nature or name of the stack to stack or all if not specified', '')
.description('stacking the appstack.json')
.parse(process.argv);

if (commander.hasOwnProperty('beautify')) options.beautify = true;
if (commander.hasOwnProperty('quiet')) options.warning = false;
if (commander.hasOwnProperty('filter')) options.filter = commander.filter;

appstack.stack(options);