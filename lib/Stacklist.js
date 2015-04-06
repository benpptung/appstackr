/**
 * tasklist suck, so we write new Stacklist to hold our stacks
 */
require('./globals');

var EventEmitter = require('events').EventEmitter;
var util = require('util'),
    inherits = util.inherits,
    inspect = util.inspect,
    format = util.format;
var fs = require('fs');
var path = require('path'),
    join = path.join;

var Gaze = require('gaze').Gaze;
var async = require('async');
var debug = require('debug')('appstackr:stacklist');
var colors = require('colors');

var Task = require('./Task');
var utils = require('./utils');

var META;

module.exports = exports = stacklist;

function stacklist(options) {
  return new Stacklist(options);
}

stacklist.options = stacklist;

function Stacklist(options) {

  EventEmitter.call(this);
  var that = this;


  this._options = options && typeof options == 'object' ? options : {};
  this.filename = null;
  this.tasks = [];

  if (!META && options.META) META = options.META;

  debug('this._options: %s', inspect(this._options, {colors: true}));

  if (this._options.filesWatch) {
    this._gaze_timer = null;
    this._onTaskWatcher = taskWatcher.bind(this);
  }

  // on loaded event
  this.once('loaded', function() {

    if (that._options.filesWatch) {
      that._gaze = new Gaze(that.filename);
      that._gaze.on('changed', fileWatcher.bind(that));
      that._gaze.on('error', utils.warn);
    }
  });
}

inherits(Stacklist, EventEmitter);


Stacklist.prototype.load = function(filename) {

  if (this.filename) {
    return this.emit('error', new Error(format('Load stacklist after loaded. filename: %s', inspect(filename))));
  }

  var that = this;
  var stack2task = async.map.partial(undefined, Task.create, undefined);
  var load = async.seq( exports.load, stack2task);

  load(filename, function(err, tasks){
    if (err) return that.emit('error', err);

    that.filename = filename;
    tasks.forEach(push, that);
    that.emit('loaded', tasks);
  });

  return this;
};

Stacklist.prototype.reload = function() {

  var that = this;
  var stack2task = async.map.partial(undefined, async.seq(Task.create, add.bind(this)), undefined);
  var runner = async.seq(exports.load, prune.bind(this), stack2task);

  runner(this.filename, function(err, newtasks) {
    if (err) return that.emit('error', err);

    debug('NEW stacks.length: '+ '%s'.yellow, newtasks.length);
    that.emit('reloaded', newtasks);
  });
};

Stacklist.prototype.run = function(filter, callback) {
  var tasks;
  var that = this;

  if (typeof filter == 'function') {
    callback = filter;
    filter = null;
  }
  tasks = filter ? this.tasks.filter(function(task){ return task.filteredIn(filter) }) : this.tasks;

  async.eachLimit(
    tasks,
    this._options.stackLimit || 20,
    function(task, done) {
      task.run(done);
    },
    function(err) {
      if (tasks.length == 0) {
        err = new Error('no stack found: ' + filter);
        err.stack = null;
      }

      if (typeof callback == 'function') return callback(err);

      if (err) return that.emit('error', err);
      that.emit('finish');
    }
  )
};

var add = function(task, callback) {

  var that = this;
  task.run(function(err) {

    if (err) return callback(err);
    push.call(that, task);
    callback();
  });
};

var push = function(task) {

  if (this._options.filesWatch) {
    task.on('changed', this._onTaskWatcher);
    task.on('error', utils.warn);
    utils.message('Watching stack %s:%s.', task.filename.magenta, task.nature.magenta);
  }
  else {
    utils.message('Stack %s:%s added.', task.filename.magenta, task.nature.magenta);
  }

  this.tasks.push(task);
  // no listner to destroyed event, because prune will destroy the task and remove them from task[]
};

var prune = function(stacks, callback) {

  var tasks = this.tasks;
  var _stacks = stacks;

  debug('BEFORE prune stacks.length: '+ '%s'.yellow, this.tasks.length);

  this.tasks = tasks.filter(function(task) {

    var stack_found = false;
    _stacks = _stacks.filter(function(stack) {
      if (task.isStack(stack)) {
        stack_found = true;
        return false;
      }
      return true;
    });

    if (!stack_found) {
      utils.message('stack destroyed: %s:%s', task.filename.magenta, task.nature.magenta );
    }

    return stack_found ? stack_found : task.destroy();
  });

  debug('AFTER prune stacks.length: ' + '%s'.yellow, this.tasks.length);

  if (typeof callback == 'function') return callback(null, _stacks);
  return _stacks;
};


var fileWatcher = function() {
  /// trottle to avoid multiple events triggered by Gaze
  clearTimeout(this._gaze_timer);
  this._gaze_timer = setTimeout(this.reload.bind(this), 5);
};

var taskWatcher = function(task) {
  this.emit('changed', task);
};

exports.load = function(filename, callback) {

  var file = join(process.cwd(), filename);

  fs.readFile(file, 'utf8', function(err, str) {
    var stacks, fn, mod = {};

    if (err) return callback(err);
    try {

      fn = new Function('module', str);
      fn(mod);
      stacks = mod.exports;

      if (!Array.isArray(stacks)) callback(new TypeError(format(
        'stacks.js module.exports should be an array, but got %s from %s', inspect(stacks), file)));

    } catch (err) { return callback(err) }

    duplicate_stacks_checker(stacks, callback);
  });

  var duplicate_stacks_checker = function(stacks, done) {

    var _stacks = [], error;
    stacks.some(function(stack){

      _stacks.some(function(s){
        if (s.name == stack.name && s.nature == stack.nature) {
          error = new Error(format('duplicated stack found name:%s, nature:%s', s.name, s.nature));
        }
        return error;
      });

      _stacks.push(stack);
      return error;
    });

    error ? done(error) : done(null, stacks);
  };
};

