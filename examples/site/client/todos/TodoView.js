/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/25
 * Time: AM10:19
 */

var utils = require('./utils'),
    $ = utils.$,
    extend = utils.extend;


exports.create = function(model){
  return new TodoView(model);
};

function TodoView(model){

  this._model = model;

  this.$el = $('<li class="list-group-item list-group-item-info"></li>');
  this.$input = null;

  this.template = $('#item-template').tmpl();

  this.$el.on('click', '.toggle', toggleDone.bind(this));
  this.$el.on('dblclick', '.view', edit.bind(this));
  this.$el.on('click', '.destroy', clear.bind(this));
  this.$el.on('keypress', '.edit', updateOnEnter.bind(this));
  this.$el.on('blur', '.edit', close.bind(this));

  this._model.on('change', this.render.bind(this));
  this._model.on('destroy', this.remove.bind(this));
}

extend(TodoView.prototype, utils.traits);

TodoView.prototype.render = function(){
  this.$el.html(this.template(this._model.toJSON()));
  this.$el.toggleClass('done', this._model.done);
  this.$input = $('.edit', this.$el);
  return this;
};

TodoView.prototype.remove = function(){
  this.$el.remove();
};

var toggleDone = function(){
  this._model.toggle();
};

var edit = function(){
  this.$el.addClass('editing');
  this.$input.focus();
};

var close = function(){
  var val = this.$input.val();

  if (!val){
    clear.apply(this);
  }
  else {
    this._model.save( {title : val});
    this.$el.removeClass('editing');
  }
};

var updateOnEnter = function(e){
  if (e.keyCode == 13) close.apply(this);
};

var clear = function(){
  this._model.destroy();
};