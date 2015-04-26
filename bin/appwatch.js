#!/usr/bin/env node

var util = require('util'),
    inspect = util.inspect,
    format = util.format;
var net = require('net');

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
  browserSync: true
};
var retry = 5;
var total = retry;
var proxy_href;
var client;

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

if (config.bsync.proxy) {
  proxy_href = config.bsync.proxy.target || config.bsync.proxy;
  proxy_href = proxy_href.split(':');
  /*setTimeout(function () {
    client = net.connect({host: proxy_href[0], port: proxy_href[1] || 80 });
    client
      .on('connect', function () {

        start();

        client.destroy();
      })
      .on('error', function(error) {

        utils.warn('%s connect %s.', error.toString().red, proxy_href.join(':').red);
      });
  }, 100);*/

  req();

  function req() {
    var client = net.connect({host: proxy_href[0], port: proxy_href[1] || 80});
    client
      .on('connect', function () {
        start();
        client.destroy();
        utils.message('tried %s times', (total - retry) + 1);
      })
      .on('error', function(error) {

        client.destroy();
        retry--;
        utils.message('connect server failed. will retry. %s retries remains.'.green, retry);
        if (retry > 0) {
          return setTimeout(req, 500);
        }
        utils.warn('%s connect %s. after %s retries', error.toString().red, proxy_href.join(':').red, (total + '').red);
      })
  }

}
else {
  start();
}

function start() {
  stacklist
    .options(config)
    .on('error', error)
    .on('loaded', loaded)
    .on('reloaded', function(tasks) {
      utils.message('stacks.js'.magenta + ' reloaded. new stacks added: ' + '%d'.green, tasks.length);
    })
    .load(stackfile);
}

function loaded(tasks) {
  utils.message('All stacks loaded. '.yellow + 'stacks.js'.magenta + ' and files watching started.'.yellow);

  if (program.initRun) {
    run_stacking(this, config, init_browser_sync.bind(null, config));
    return;
  }
  init_browser_sync(config);
}

function error(error) {
  utils.warn(error);
}

function init_browser_sync(options) {
  browserSync(options.bsync);
}

function run_stacking(stacklist, options, callback) {

  var task_runner = stacklist.run.bind(stacklist);
  var runner = options.cleanStacks ? async.seq(utils.clean.partial('stack', undefined), task_runner) : task_runner;

  runner(callback);
}
