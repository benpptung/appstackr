'use strict';

var through = require('through');

module.exports = function (options) {

  var data = [];
  var htmlcompressor = options.htmlcompressor;

  return through(write, end);

  function write(chunk) {
    data.push(chunk);
  }

  function end() {
    var that = this;

    data = Buffer.concat(data).toString('utf8');
    htmlcompressor(data, function(err, data) {
      if (err) return that.emit(err);
      if (Buffer.isBuffer(data)) data = data.toString('utf8');
      that.queue('module.exports=' + JSON.stringify(data));
      that.queue(null);
    })
  }
};