'use strict';

var util = require('util');

var CleanCSS = require('clean-css');
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
    process.send(CONFIG_RECIEVED);
  }
});

process.stdin.on('data', function(chunk) {
  codes.push(chunk);
});

process.stdin.on('end', function() {

  codes = Buffer.concat(codes).toString('utf8');

  cp_message('child %d'.blue + 'BEFORE-MINIFY codes.length %d', process.pid, codes.length);

  /// this is a sync function
  if (!config.beautify) {
    codes = (new CleanCSS({
      keepSpecialComments: 0,
      processImport: false,
      rebase: true
    })).minify(codes).styles;
  }

  cp_message('child %d'.blue + 'BEFORE-MINIFY codes.length %d', process.pid, codes.length);

  process.stdout.write(codes, function() {
    process.exit();
  })

});

mock_stdout();