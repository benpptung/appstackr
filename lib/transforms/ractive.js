'use strict';

var path = require('path'),
    join = path.join;
var fork = require('child_process').fork;
var util = require('util'),
    format = util.format;

var through = require('through');
var ractive_module = join(__dirname, '..', 'childs', 'ractive.js');
var debug = require('debug')('appstackr:ractive');

module.exports = function (options) {

  var cp = fork(ractive_module, { silent: true });
  var tr = through(write, end);
  var error;
  var log = options.logging || function () {};
  var warn = options.warn || function () {};

  cp.on('message', function(message) {

    if (message == 'config recieved') return;

    if (typeof message.message == 'string') {
      // message with message propperty should be an Error Object
      error = message;
    }

    log(message);
  });

  cp.on('error', function (err) {
    if (!error) {
      error = err;
      return;
    }
    warn(err);
  });

  cp.stderr.on('data', function(chunk) {
    warn(chunk.toString());
  });

  cp.stdout.on('data', function(chunk) {

    debug('cp.stdout on data');

    tr.queue(chunk.toString('utf8'));
  });

  cp.on('close', function (code, signal) {

    if ( code != 0) {
      if (!error) error = new Error(format('child process %s about %s exits with error code %s and signal %s', cp.pid, 'ractive.js', code, signal));
      return tr.emit('error', error);
    }

    debug('close');

    tr.queue(null);
  });

  function write (buff) {
    cp.stdin.write(buff);
  }

  function end () {
    cp.stdin.end();
  }

  return tr;
};

