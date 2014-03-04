/**
 * User: benpptung
 * Date: 2014/1/30
 * Time: PM12:08
 */

exports.homepage = function(){
  return function(req, res){
    res.render('index');
  }
};

exports.bs = function(){
  return function(req, res){
    res.render('bs-theme', { title: 'We can easily customize our bootstrap theme'});
  }
};

exports.vacationNote = function(){
  return function(req, res){
    res.render('vacation-note');    
  }
};

exports.test = function(){
  return function(req, res){
    res.render('test');
  }
}