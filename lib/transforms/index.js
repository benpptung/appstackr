'use strict';

var path = require('path');
var extname = path.extname;
var through = require('through');
var babelify = require('babelify');
var filecopy = require('transforms').filecopier;
var ractive = require('./ractive');
var htmlview = require('./htmlview');
var styles = require('./styles');


module.exports = function(options) {

  options = options && typeof options == 'object' ? options : {};

  var viewEngines = options.viewEngines || [];
  var cssExts = options.cssExtnames;
  var jsExts = options.jsEXNames;
  var filecopyConfig = options.filecopy;
  var cssTransform = options.cssTransform;
  var autoprefixer = options.autoprefixer;
  var babel = options.babel;

  // remove ['.js'].concat() someday when uglify-js upgraded for new browsers, if possible, we DO NOT transpile!
  // ['.js'].concat() is important or babelify will not transform ext === '.js'
  var jsx = babelify.configure(Object.assign({ extensions: ['.js'].concat(jsExts) }, babel));

  return function (file) {

    var ext = extname(file);
    if (ext == '.ract') return ractive(options);
    if (~viewEngines.indexOf(ext) != 0) return htmlview(options);
    if (~cssExts.indexOf(ext) != 0) return styles({ file: file, cssTransform: cssTransform, autoprefixer: autoprefixer });

    // remove ext == '.js' someday when uglify-js upgraded for new browsers, if possible, we DO NOT transpile!
    if (~jsExts.indexOf(ext) != 0 || ext == '.js') return jsx(file);
    if (~filecopyConfig.moveExtnames.indexOf(ext) != 0) return filecopy(file, filecopyConfig);

    return through();
  };
};
