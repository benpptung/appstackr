var fs = require('fs');
var path = require('path');

var async = require('async');
var colors = require('colors');

var config = require('./globals').config;
//var tasklist = require('./tasklist');
var appbuild = require('./appbuild');
var utils = require('./utils');
var Task = require('./Task');
var stacklist = require('./stacklist');

var appstack_filename = exports.stacksFileName = 'stacks.js';

/**
 *
 * @param {object} [options] - options: beautify, warning and filter
 * @param {function} [callback]
 */
exports.stack = function(options, callback){
  // stablize our variables
  var filter;
  if (typeof options == 'function'){ callback = options; options = {}; }
  callback = typeof callback == 'function' ? callback : function(){};

  config.final(options);
  filter = options.filter;

  stacklist
    .options(config)
    .on('error', function(err) {
      utils.warn(err);
      callback(err);
    })
    .on('loaded', function() {
      utils.message('stack list finalized. Start to run.');

      var task_runner = this.run.bind(this);
      var runner = config.cleanStacks ? async.seq(utils.clean.partial('stack', undefined), task_runner) : task_runner;

      runner(filter, function(err) {
        if (err) {
          utils.warn(err);
          return callback(err);
        }
        utils.message('stacking completed');
        callback();
      });
    })
    .load(appstack_filename);

  // stacks loaded in tasklist
  /*final_tasklist(path.join(process.cwd(), appstack_filename), function(err){
    if (err) return utils.error(err) || callback(err);

    utils.log('tasklist finalized. Start to run tasklist.');

    var tasks_runner = tasklist.run.partial(filter, undefined),
        runner = config.cleanStacks ? async.compose( tasks_runner, utils.clean.partial('stack', undefined)) : tasks_runner;

    runner(function(err){
      if (err) return utils.error(err) || callback(err);
      return utils.log('stack tasks running completed.') || callback();
    });
  });*/
};

/**
 *
 * @param {object} [options] - options: viewmini, viewjsmini, viewcssmini
 * @param {function} [callback]
 */
exports.build = function(options, callback){

  if (typeof options == 'function'){

    callback = options;
    options = {};
  }
  callback = typeof callback == 'function' ? callback : function(){};

  config.final(options);

  appbuild(callback);
  // load tastlist, in case appbuild need it
  //utils.log('load tasklist if we need to depends on tasklist');
  /*final_tasklist(path.join(process.cwd(), appstack_filename), function(err){
    // ignore error, because appbuild could go without stacks
    utils.log('tasklist final for appbuild');
    appbuild({tasklist: !err}, callback);
  })*/
};
/*

var final_tasklist = function(appstack_file, callback){
  var tasking = async.compose( tasklist.addTask , Task.create),
      run = async.compose( async.each.partial(undefined, tasking, undefined) , tasklist.rawStacks);

  run(appstack_file, callback);
};*/
