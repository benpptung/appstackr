/**
 * User: benpptung
 * Date: 2014/2/7
 * Time: AM10:03
 */

var profile = require('./profile'),
    pathpairs = {},
    utils = require('./utils'),
    url = require('url'),
    path = require('path');

//var urlpattern = /(?:url\s*\(\s*|src\s*=\s*|href\s*=\s*)['"]?(\/(?!\/)[^\?'">)]+)/img;

var urlpattern;

urllist = exports;

urllist.pair = function (path_pair) {
  pathpairs[path_pair.localUrl] = path_pair.cdnUrl;
};

/**
 *
 * @param {String} codes - css or html files in utf8 string format
 * @param {Function} callback - ({Error}, {Buffer})
 */
urllist.urlrefactor = function (codes, callback) {
  var matches, memo = [], urlpattern = urlpattern || create_url_pattern();

  // build the url list found in the current codes
  while (matches = urlpattern.exec(codes)) {
    if (memo.indexOf(matches[1]) < 0) memo.push(matches[1]);
  }
  if (!memo.length) return callback(null, new Buffer(codes));

  // looping the url list and replace them from localUrl to cdnUrl
  memo.forEach(function (urlpath) {
    if (pathpairs[urlpath]) {
      return codes = codes.replace(new RegExp(RegExp.quote(urlpath), 'gim'), pathpairs[urlpath]);
    }

    //if (profile.warning && !is_origindomain(urlpath)) {
    if (profile.warning){
      // show warnings if unused url path found
      utils.log('might be broken link: ' + urlpath);
    }
  });

  callback(null, new Buffer(codes));
};
/*
var is_origindomain = function(file){
  var reg = new RegExp('^' + RegExp.quote('/' + path.basename(profile.origindomain)));
  return reg.test(file);
};*/

var create_url_pattern = function () {
  var dirprop = require('./dirprop'),
      dir_rel_paths = dirprop.publicDirsRelPath();

  dir_rel_paths = dir_rel_paths.map(function(dir){
    return RegExp.quote(dir);
  });
  return new RegExp('(?:url\\s*\\(\\s*|src\\s*=\\s*|href\\s*=\\s*|:\\s*)[\'"]?((' + dir_rel_paths.join('|') + ')[^\\?\'"#>)]+)', 'img');
};