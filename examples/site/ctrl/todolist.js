/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/25
 * Time: PM3:18
 */

var todolist = [];

exports.todoMVC = function(){
  return function(req, res){
    res.render('todo-mvc');
  }
};

exports.list = function(){
  return function(req, res){
    res.json(todolist);
  }
};

exports.update = function(){
  return function(req, res){
    todolist = req.body;
    console.log('todolist-update:', todolist);
    res.json({message: 'success'});
  }
}