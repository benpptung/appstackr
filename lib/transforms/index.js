'use strict';

var path = require('path'),
    extname = path.extname;

var through = require('through');
var ractive = require('./ractive');
var htmlview = require('./htmlview');
var styles = require('./styles');
var jsx = require('./jsx');

module.exports = function(options) {

  options = options && typeof options == 'object' ? options : {};
  var viewEngines = options.viewEngines || [];
  var cssExts = options.cssExtnames;
  var cssTransform = options.cssTransform;
  var autoprefixer = options.autoprefixer;

  return function (file) {

    var ext = extname(file);

    if (ext == '.ract') return ractive(options);
    if (~viewEngines.indexOf(ext) != 0) return htmlview(options);
    if (~cssExts.indexOf(ext) != 0) return styles({ file: file, cssTransform: cssTransform, autoprefixer: autoprefixer });
    if (ext == '.jsx') return jsx(options);
    return through();
  };
};
