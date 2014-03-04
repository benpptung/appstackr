/**
 * User: benpptung
 * Date: 2014/2/9
 * Time: AM9:24
 */

var path = require('path'),
    async = require('async'),
    profile = require('./profile');

var tasks = [], rawStacks;

var tasklist = module.exports = {};

/**
 * natures allowed in {Task}
 * @type {RegExp}
 */
tasklist.natures = /^(js|jhtml|css|chtml|html)$/;

/**
 * Server side codes CommonJS linkers for browser
 * We can add more linkers here, and edit the {Task}
 * @type {RegExp}
 */
tasklist.commonjsLinkers = /^(webmake|browserify)$/;

/**
 *
 * @param {String} stacks_file
 * @param {Function} callback - (err, rawStacks)
 */
tasklist.rawStacks = function(stacks_file, callback){
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

  async.eachLimit(tasks, profile.stackLimit, function(task, done){
    task.run(done);
  }, callback)
};

tasklist.clean = function(){
  tasks = [];
};


var taskFilter = function (filter) {
  if (!filter || typeof filter != 'string') return tasks;
  var res = [],
      prop = tasklist.natures.test(filter) ? 'nature' : 'name';

  tasks.forEach(function(task){
    if (task[prop] == filter) res.push(task);
  });

  return res;
};

var anyError = function(task){
  var err = null;

  tasks.forEach(function(t){
    if (t.name == task.name && t.nature == task.nature) err = new Error('Task cannot have same name and nature at the same time.');
  });
  return err;
};