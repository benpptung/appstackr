/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/24
 * Time: PM9:38
 */
var utils = require('./utils'),
    extend = utils.extend;


exports.create = function(todolist){
  return new Todo(todolist);
};

function Todo(todolist){

  this.title = 'empty title...';
  this.order = todolist.nextOrder();
  this.done = false;
  this._todolist = todolist;
}

extend(Todo.prototype, utils.traits);

// Events : destroy, change
Todo.prototype.destroy = function(){
  this.trigger('destroy');
  this._todolist.remove(this);
  this.off();
};

Todo.prototype.save = function(data){
  var that = this;
  if (data.hasOwnProperty('title')) this.title = data.title;
  if (data.hasOwnProperty('done')) this.done = data.done;
  if (data.hasOwnProperty('order')) this.order = data.order;
  this.trigger('change');
  setTimeout(function(){
    that._todolist.trigger('change');
  }, 0);

  return this;
};

// methods not trigger Event

Todo.prototype.toggle = function(){
  this.save({done: !this.done});
};

Todo.prototype.toJSON = function(){
  return {
    title: this.title,
    order: this.order,
    done : this.done
  }
};

