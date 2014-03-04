/**
 * User: benpptung
 * Date: 2014/1/30
 * Time: PM12:08
 */

exports.index = function(){
  return function(req, res){
    res.render('index');
  }
};

exports.bs = function(){
  return function(req, res){
    res.render('bootstrap-theme', { title: 'bs is ok beauty.'});
  }
}