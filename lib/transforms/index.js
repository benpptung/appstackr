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
  var jsx = babelify.configure({ extensions: jsExts });

  return function (file) {

    var ext = extname(file);

    if (ext == '.ract') return ractive(options);
    if (~viewEngines.indexOf(ext) != 0) return htmlview(options);
    if (~cssExts.indexOf(ext) != 0) return styles({ file: file, cssTransform: cssTransform, autoprefixer: autoprefixer });
    if (~jsExts.indexOf(ext) != 0) return jsx(file);
    if (~filecopyConfig.moveExtnames.indexOf(ext) != 0) return filecopy(file, filecopyConfig);

    return through();
  };
};
