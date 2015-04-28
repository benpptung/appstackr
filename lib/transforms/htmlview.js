'use strict';

var through = require('through');

module.exports = function (options) {

  var data = [];
  var htmlcompressor = options.htmlcompressor;
  var viewMini = options.viewMini;

  return through(write, end);

  function write(chunk) {
    data.push(chunk);
  }

  function end() {
    var that = this;

    data = Buffer.concat(data).toString('utf8');

    if (viewMini !== true) {
      this.queue('module.exports=' + JSON.stringify(data));
      this.queue(null);
      return;
    }

    htmlcompressor(data, function(err, data) {
      if (err) return that.emit(err);
      if (Buffer.isBuffer(data)) data = data.toString('utf8');
      that.queue('module.exports=' + JSON.stringify(data));
      that.queue(null);
    })
  }
};