'use strict';

var util = require('util'),
    inspect = util.inspect,
    format = util.format;

exports.message = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var message;

  if (typeof args[0] == 'string') {
    // process.send() accept only one argument
    message = format.apply(undefined, args);
  }
  // send only first parameter back parent process
  if (!message) message = args[0];

  process.send(message);
};

exports.mockStdout = function() {
  util.print = util.puts = util.log = console.dir = console.info = console.log = function() {
      exports.message.apply(undefined, Array.prototype.slice.call(arguments, 0));
  };
};

exports.CONFIG_RECIEVED = 'config recieved';