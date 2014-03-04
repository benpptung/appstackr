/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/25
 * Time: PM12:14
 */

var utils = require('./utils'),
    $ = utils.$,
    extend = utils.extend,
    Todolist = require('./Todolist'),
    TodoView = require('./TodoView');

function AppView(el){
  // element or jQuery objects
  this.$el = $(el);
  this.$input = $('.new-todo', this.$el);
  this.allCheckbox = $('#toggle-all', this.$el)[0];
  this.$footer = $('footer', this.$el);
  this.$main = $('.main', this.$el);
  this.$list = $('.todo-list', this.$el);

  // template function
  this.template = $('#stats-template').tmpl();
  this._todolist = Todolist.connect(this.$el.data('remote'));

  // events binding
  this.$el.on('keypress', this.$input, createOnEnter.bind(this));
  this.$el.on('click', '.clear-completed', clearCompleted.bind(this));

  this.$el.on('click', '#toggle-all', toggleAllComplete.bind(this));

  this._todolist.on('addone', addOne.bind(this));
  this._todolist.on('loaded', reset.bind(this));
  this._todolist.on('change', render.bind(this));
  this._todolist.on('error', function(e, err){
    console.log(err);
  })
}

extend(AppView.prototype, utils.traits);

var render = function(){
  var done = this._todolist.done().length,
      remaining = this._todolist.remaining().length;

  if (this._todolist.len()){
    this.$main.show();
    this.$footer.html(this.template({done: done, remaining: remaining})).show();
  }
  else {
    this.$main.hide();
    this.$footer.hide();
  }
  this.allCheckbox.checked = !remaining;
};

var addOne = function(e, todo){
  var view = TodoView.create(todo);
  this.$list.append(view.render().$el);
};

var reset = function(){
  this.$list.empty();
  this._todolist.each(addOne.bind(this).partial(null, undefined));
};

var createOnEnter = function(e){
  if (e.keyCode != 13) return;
  if (!this.$input.val()) return;

  // this is the starting point to add todo, and also how todolist accept data and produce todo
  this._todolist.create({title: this.$input.val()});
  this.$input.val('');
};

var clearCompleted = function(){
  this._todolist.done().forEach(function(todo){
    todo.destroy();
  })
  return false;
};

var toggleAllComplete = function(){
  var done = this.allCheckbox.checked;
  this._todolist.each(function(todo){
      todo.save({ 'done' : done});
  });
};





/*
 *  jQuery plugin way to embed to view
 */
var old = $.fn.todos;

$.fn.todos = function(option){
  return this.each(function(){
    var $this = $(this),
        data = $this.data('todos'),
        options = typeof option == 'object' && option;

    if (!data) $this.data('todos', (data = new AppView(this, options)));
    if (typeof option == 'string') data[option].apply(data, Array.prototype.slice.call(arguments, 1));
  });
};

$.fn.todos.noConflict = function(){
  $.fn.todos = old;
  return this;
};

$('document').ready(function(){
  var $this = $('[data-provide="todos"]')
  $this.todos();
});