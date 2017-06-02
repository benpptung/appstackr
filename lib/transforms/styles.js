'use strict';

var path = require('path'),
    join = path.join,
    basename = path.basename,
    dirname = path.dirname;
var through = require('through');

module.exports = function(options) {

  var filename = basename(options.file);
  var paths = [dirname(options.file)];
  var transform = options.cssTransform;
  var autoprefixer = options.autoprefixer;
  var text = [];

  return through(write, end);

  function write(chunk) {
    text.push(chunk);
  }

  function end() {
    var that = this;
    text = Buffer.concat(text).toString('utf8');
    transform(text, {filename: filename, paths: paths, autoprefixer: autoprefixer}, function (err, codes) {
      if (err) return that.emit('error', err);
      that.queue('module.exports=' + JSON.stringify(codes));
      that.queue(null);
    });
  }

};