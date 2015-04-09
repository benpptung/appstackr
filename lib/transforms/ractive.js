'use strict';

var Ractive = require('ractive');
var through = require('through');

module.exports = function(options) {

  var codes = [];

  return through(write, end);

  function write(chunk) {
    codes.push(chunk);
  }

  function end() {
    codes = Buffer.concat(codes).toString('utf8');

    try {
      codes = 'module.exports=' + JSON.stringify(Ractive.parse(codes));
    }
    catch (err) {
      return this.emit('error', err);
    }

    this.queue(codes);
    this.queue(null);
  }
};