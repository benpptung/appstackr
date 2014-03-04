/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/24
 * Time: PM9:44
 */

var utils = require('./utils'),
    $ = utils.$,
    extend = utils.extend,
    Todo = require('./Todo');

var unique, todos = [];

/**
 *
 * @param url
 * @returns {Todolist}
 */
exports.connect = function (url) {
  if (!unique) {
    unique = new Todolist(url);
  }
  return unique;
};

/**
 *
 * @param url
 * @constructor
 */
function Todolist(url) {
  var that = this;

  this._url = url;
  this._tIdSync = null;
  this._tIdRemove = null;

  setTimeout(function () {
    $.get(url)
        .fail(function(jqXHR){
          var err = new Error('Http Error');
          err.status = jqXHR.status;
          err.statusText = jqXHR.statusText;
          err.responseText = jqXHR.responseText;
          that.trigger('error', err);
        })
        .done(function(todos_array, text_status, jqXHR){
          if (!Array.isArray(todos_array)){
            // check the data parsed
            return that.trigger('error', new TypeError('responseText is not Array. it is typeof [' + typeof todos_array + '] ' + todos_array));
          }

          todos_array.forEach(function(todo_json){
            var todo = Todo.create(that);
            todos.push(todo.save(todo_json));
          });
          that.trigger('loaded');
        });
  }, 0);

  this.on('change', sync.bind(this));

}

$.extend(Todolist.prototype, utils.traits);

Todolist.prototype.create = function (json) {
  var todo = Todo.create(this);
  todos.push(todo.save(json));
  this.trigger('addone', todo);
  this.trigger('change');
};

Todolist.prototype.each = function (iterator) {
  todos.forEach(iterator);
};

Todolist.prototype.nextOrder = function () {
  var l = this.len();
  return ++l;
};

Todolist.prototype.remove = function (todo) {
  var that = this;
  clearTimeout(this._tIdRemove);

  todos = todos.filter(function(item){
    return !(item === todo);
  })
  this._tIdRemove = setTimeout(function () {
    that.trigger('change');
  }, 100);
};


Todolist.prototype.done = function () {
  return todos.filter(function (todo) {
    return !!todo.done;
  });
};

Todolist.prototype.remaining = function () {
  return todos.filter(function (todo) {
    return !todo.done;
  });
};

Todolist.prototype.len = function () {
  return todos.length;
};


var sync = function () {
  var that = this;
  clearTimeout(this._tIdSync);
  this._tIdSync = setTimeout(function () {
    $.ajax(that._url, {
      data: JSON.stringify(todos.map(function (todo) {
        return todo.toJSON();
      })),
      cache: false,
      contentType: 'application/json',
      processData: false,
      type: 'post',
      dataType: 'json',
      global: false
    })
        .fail(function(jqXHR){
          var err = new Error('HTTP Error');
          err.status = jqXHR.status;
          err.statusText = jqXHR.statusText;
          err.responseText = jqXHR.responseText;
          that.trigger('error', err);
        })
        .done(function(res, text_status, jqXHR){
          if (console) console.log(res);
        })
  }, 500);
};