/**
 * User: benpptung
 * Date: 2014/2/9
 * Time: AM9:24
 */

var path = require('path');
var fs = require('fs');
var util = require('util'),
    format = util.format;
var async = require('async');
var config = require('./globals').config;

//var tasks = [], rawStacks;


var tasklist = module.exports = {};
var tasks = [];

/**
 * natures allowed in {Task}
 * @type {RegExp}
 */
//tasklist.natures = /^(js|jhtml|css|chtml|html)$/;

/**
 * Server side codes CommonJS linkers for browser
 * We can add more linkers here, and edit the {Task}
 * @type {RegExp}
 */
//tasklist.commonjsLinkers = /^(webmake|browserify)$/;

/**
 *
 * @returns {Array}
 */
/*tasklist.tasks = function(){
  return tasks;
};*/

/**
 *
 * @param {String} stacks_file
 * @param {Function} callback - (err, rawStacks)
 */
/*tasklist.rawStacks = function(stacks_file, callback){
  var stacks;

  if (!rawStacks){
    try {
      stacks = require(stacks_file);
      if (!Array.isArray(stacks)) return callback(new TypeError( path.basename(stacks_file) + ' is not an array'));
      rawStacks = stacks;
    }
    catch (err){
      return callback(err);
    }
  }
  callback(null, rawStacks);
};*/

/**
 *
 * @param {String} stacks_file
 * @param {Function} callback - (err, rawStacks)
 */
tasklist.rawStacks = function(stacks_file, callback){

  fs.readFile(stacks_file, 'utf8', function(err, str){
    var stacks, fn, mod = {};

    if (err) return callback(err);
    try {

      fn = new Function('module', str);
      fn(mod);
      stacks = mod.exports;

      if (!Array.isArray(stacks)) callback(new ReferenceError(format('stacks.js should provide an array. but got %s from %s', typeof stacks, stacks_file)));

    } catch (ex) { return callback(ex) }

    callback(null, stacks);

  });
};

/**
 * @param {Task} task
 * @param {Function} [callback]
 */
tasklist.addTask = function (task, callback) {
  var err;
  callback = typeof callback == 'function' ? callback : function(){};

  if (err = anyError(task)) return callback(err);
  tasks.push(task);
  callback();
};

/**
 * @param {String} [filter]
 * @param {Function} [callback]
 */
tasklist.run = function (filter, callback) {
  var tasks;
  if (typeof filter == 'function'){
    callback = filter;
    filter = null;
  }
  callback = typeof callback == 'function' ? callback : function(){};
  tasks = taskFilter(filter);

  if (tasks.length == 0){
    return callback(new Error('no task found: ' + filter));
  }

  async.eachLimit(tasks, config.stackLimit, function(task, done){
    task.run(done);
  }, callback)
};

/*tasklist.clean = function(){
  tasks = tasks.filter(function(task){ task.destroy() });
};*/


var taskFilter = function (filter) {
  if (!filter || typeof filter != 'string') return tasks;
//  var res = [],
//      prop = tasklist.natures.test(filter) ? 'nature' : 'name';
  var res = [];

  tasks.forEach(function(task){
    //if (task[prop] == filter) res.push(task);
    if (task.filteredIn(filter)) res.push(task);
  });

  return res;
};

var anyError = function(task){
  var err = null;

  tasks.forEach(function(t){
    if (t.filename == task.filename && t.nature == task.nature) err = new Error('Task cannot have same name and nature at the same time.');
  });
  return err;
};

