'use strict';

var through = require('through');

module.exports = function(options) {

  var transform = options.reactTransform;
  var codes = [];

  return through(write, end);

  function write(chunk) {
    codes.push(chunk);
  }

  function end() {
    var that = this;
    codes = Buffer.concat(codes).toString('utf8');

    transform(codes, function (err, codes) {
      if (err) return that.emit('error', err);
      that.queue(codes);
      that.queue(null);
    })
  }
};