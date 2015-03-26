#!/usr/bin/env node

var util = require('util'),
    inspect = util.inspect,
    format = util.format;

var program = require('commander');
var browserSync = require('browser-sync');
var colors = require('colors');
var async = require('async');

var config = require('../lib/globals').config;
var utils = require('../lib/utils');
var stackfile = require('../lib/appstack').stacksFileName;
var stacklist = require('../lib/stacklist');
var version = require('../package.json').version;

var options = {
  filesWatch: true,
  browserSync: true,
  warning: false
};

program
  .version(version)
  .usage('[options]')
  .option('-i, --init-run', 'run appstack initially to build stacks')
  .option('-s, --server [href]', 'set browser-sync proxy to, e.g. 0.0.0.0:3000')
  .option('-b, --browser-sync', format('start browser-sync static server to %s', config.public.green))
  .description('appstackr to integrate browser-sync for front-end development')
  .parse(process.argv);

if (typeof program.server == 'string') {
  options.proxy = program.server;
}
if (program.browserSync) {
  options.server = true;
}

config.final(options, 'appwatch');

stacklist
  .options(config)
  .on('error', error)
  .on('loaded', loaded)
  .on('reloaded', function(tasks) {
    utils.message('stacks.js'.magenta + ' reloaded. new stacks added' + '%d'.yellow, tasks.length);
  })
  .load(stackfile);

function loaded(tasks) {
  utils.message('All stacks loaded. '.yellow + 'stacks.js'.magenta + ' and files watching started.'.yellow);

  if (program.initRun) {
    run_stacking(this, config, init_browser_sync.bind(null, config));
    return;
  }
  init_browser_sync(config);
}

function error(error) {
  utils.message(error.toString().red);
}

function init_browser_sync(options) {
  browserSync(options.bsync);
}

function run_stacking(stacklist, options, callback) {

  var task_runner = stacklist.run.bind(stacklist);
  var runner = options.cleanStacks ? async.seq(utils.clean.partial('stack', undefined), task_runner) : task_runner;

  runner(callback);
}
