var profile = require('./profile'),
    tasklist = require('./tasklist'),
    appbuild = require('./appbuild'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    utils = require('./utils'),
    Task = require('./Task');

var appstack_filename = 'stacks.js';

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
  profile.finalProfile(options);
  filter = options.filter;

  // stacks loaded in tasklist
  final_tasklist(path.join(process.cwd(), appstack_filename), function(err){
    if (err) return utils.error(err) || callback(err);

    utils.log('tasklist finalized. Start to run tasklist.');

    var tasks_runner = tasklist.run.partial(filter, undefined),
        runner = profile.cleanStacks ? async.compose( tasks_runner, utils.clean.partial('stack', undefined)) : tasks_runner;

    runner(function(err){
      if (err) return utils.error(err) || callback(err);
      return utils.log('stack tasks running completed.') || callback();
    });
  });
};

/**
 *
 * @param {object} [options] - options: viewmini, viewjsmini, viewcssmini
 * @param {function} [callback]
 */
exports.build = function(options, callback){
  if (typeof options == 'function'){
    callback = options; options = {};
  }
  callback = typeof callback == 'function' ? callback : function(){};

  profile.finalProfile(options);
  // load tastlist, in case appbuild need it
  utils.log('load tasklist if we need to depends on tasklist');
  final_tasklist(path.join(process.cwd(), appstack_filename), function(err){
    // ignore error, because appbuild could go without stacks
    utils.log('tasklist final for appbuild');
    appbuild({tasklist: !err}, callback);
  })
};

var final_tasklist = function(appstack_file, callback){
  var tasking = async.compose( tasklist.addTask , Task.create),
      run = async.compose( async.each.partial(undefined, tasking, undefined) , tasklist.rawStacks);

  run(appstack_file, callback);
};