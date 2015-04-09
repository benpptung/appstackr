'use strict';

var util = require('util');

var Ractive = require('Ractive');
var colors = require('colors');

var childutils = require('./child-utils'),
    CONFIG_RECIEVED = childutils.CONFIG_RECIEVED,
    cp_message = childutils.message,
    mock_stdout = childutils.mockStdout;

var codes = [];

process.stdin.on('data', function (chunk) {
  codes.push(chunk);
});

process.stdin.on('end', function () {
  codes = Buffer.concat(codes).toString('utf8');

  cp_message('child %d'.blue + ' BEFORE: Ractive.parse() codes.length: %d', process.pid, codes.length);

  try {

    codes = 'module.exports=' + JSON.stringify(Ractive.parse(codes));

  } catch (err) {
    cp_message(err);
    process.exit(1);
  }

  cp_message('child %d'.blue + ' AFTER: Ractive.parse() codes.length: %d', process.pid, codes.length);

  process.stdout.write(codes, function () {
    process.exit();
  })
});

mock_stdout();

// ractive doesn't need config
process.send(CONFIG_RECIEVED);