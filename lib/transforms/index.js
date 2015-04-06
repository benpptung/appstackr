'use strict';

var path = require('path'),
    extname = path.extname;

var through = require('through');
var ractive = require('./ractive');
var text = require('./text');

module.exports = function(options) {

  options = options && typeof options == 'object' ? options : {};
  var view_engines = options.viewEngines || [];

  return function (file) {

    var ext = extname(file);

    if (ext == '.ract') return ractive(options);
    if (~view_engines.indexOf(ext) != 0) return text(options);
    return through();
  };
};
