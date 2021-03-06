/**
 * User: benpptung
 * Date: 2014/2/7
 * Time: AM10:03
 */
var url = require('url');
var path = require('path');

var colors = require('colors');

var config = require('./globals').config;
var utils = require('./utils');
var pathpairs = {};


//var urlpattern = /(?:url\s*\(\s*|src\s*=\s*|href\s*=\s*)['"]?(\/(?!\/)[^\?'">)]+)/img;
//var urlpattern;

urllist = exports;

urllist.pair = function (path_pair) {
  pathpairs[path_pair.localUrl] = path_pair.cdnUrl;
};

/**
 *
 * @param {String} codes - css or html files in utf8 string format
 * @param {Boolean} js - js file or not
 * @param {Function} callback - ({Error}, {Buffer})
 */
urllist.urlrefactor = function (codes, js, callback) {
  var matches;
  var memo = [];

  if (typeof js == 'function') {
    callback = js;
    js = false;
  }

  var urlpatterns = create_url_pattern(js);
  var urlpattern;

  // build the url list found in the current codes
  for(var i = 0; i < urlpatterns.length; ++i){
    urlpattern = urlpatterns[i];
    while (matches = urlpattern.exec(codes)) {
      if (memo.indexOf(matches[1]) < 0) memo.push(matches[1]);
    }
  }

  if (!memo.length) return callback(null, new Buffer(codes));

  // looping the url list and replace them from localUrl to cdnUrl
  memo.forEach(function (urlpath) {
    if (pathpairs[urlpath]) {
      return codes = codes.replace(new RegExp(RegExp.quote(urlpath), 'gim'), pathpairs[urlpath]);
    }

    //if (config.warning && !is_origindomain(urlpath)) {
    if (config.warning){
      // show warnings if unused url path found
      utils.message('might be broken link: ' + urlpath.magenta);
    }
  });

  callback(null, new Buffer(codes));
};
/*
var is_origindomain = function(file){
  var reg = new RegExp('^' + RegExp.quote('/' + path.basename(config.origindomain)));
  return reg.test(file);
};*/

var create_url_pattern = function (js) {
  var dirprop = require('./dirprop');
  var dir_rel_paths = dirprop.publicDirsRelPath();

  dir_rel_paths = dir_rel_paths.map(function(dir){
    return RegExp.quote(dir);
  });
  return js
    ? [
        new RegExp('(?:src|href)\\s*:\\s*[\'"]((' + dir_rel_paths.join('|') + ')[^?\'"]+)', 'gim'),
        new RegExp('url\\(\\s*[\'"]?((' + dir_rel_paths.join('|') + ')[^?\'"#)]+)', 'gim')
      ]
    : [ new RegExp('(?:url\\s*\\(\\s*|src\\s*=\\s*|href\\s*=\\s*|:\\s*)[\'"]?((' + dir_rel_paths.join('|') + ')[^\\?\'"#>)]+)', 'gim') ];
};