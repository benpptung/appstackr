'use strict';

var util = require('util');

var uglify = require('uglify-js');
var colors = require('colors');

var childutils = require('./child-utils'),
    CONFIG_RECIEVED = childutils.CONFIG_RECIEVED,
    cp_message = childutils.message,
    mock_stdout = childutils.mockStdout;

var config;
var codes = [];

process.on('message', function(message) {
  if (typeof message == 'object') {
    config = message;
    /// VERY IMPORTANT!! to tell the parent to start write stdin,
    /// it would save a lot time due to message might be blocked due to stdin writing in
    /// which will waste a lot of time and occupy much resources simply because
    /// we have no config to start... So, tell the parent we've got the config, is very important!!
    process.send(CONFIG_RECIEVED);
  }
});


process.stdin.on('data', function(chunk) {
  codes.push(chunk);
});

process.stdin.on('end', function() {

  /// since we tell the parent to write data after config is recieved,
  /// we can handle the data immediately when the end event triggered.
  codes = Buffer.concat(codes).toString('utf8');

  cp_message('child %d'.blue + ' BEFORE-MINIFY codes.length %d', process.pid, codes.length);

  try {
    codes = uglify.minify(codes, {
      warnings: config.warning,
      fromString: true,
      mangle: {except: config.reserved },
      output: { beautify: config.beautify},
      compress: { warnings:config.warning, unsafe: true}
    });
  } catch (err) {
    cp_message(err);
    process.exit(1);
  }


  cp_message('child %d'.blue + ' AFTER-MINIFY codes.length %d', process.pid, codes.code.length);

  /// process.stdout && process.stderr are unlike other streams in Node in that they cannot be closed (end() will throw)
  process.stdout.write(codes.code, function() {
    process.exit();
  });

});

mock_messages();

function mock_messages() {

  /// mock util.error to hijeck uglifyjs warning message
  util.error = function(uglifyjs2_warn_message) {
      /// send back parent process whatever how child-utils.error works
      cp_message('UglifyJS2'.yellow + ' ' + uglifyjs2_warn_message);
  };

  mock_stdout();
}