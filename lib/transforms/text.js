'use strict';

var through = require('through');

module.exports = function (options) {

  var data = [];

  return through(write, end);

  function write(chunk) {
    data.push(chunk);
  }

  function end() {
    data = Buffer.concat(data).toString('utf8');
    this.queue('module.exports=' + JSON.stringify(data));
    this.queue(null);
  }
};