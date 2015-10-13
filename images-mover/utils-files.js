'use strict';

var path = require('path');
var join = path.join;
var resolve = path.resolve;
var fs = require('fs');
var async = require('async');

exports.moverTransformer = function(codes, file, callback) {

  var mover;
  try {
    mover = JSON.parse(codes);
  } catch(err) { return callback(null, codes)}

  if (!exports.isFilesMover(mover)) return callback(null, codes);

  exports.moveFiles(mover.list, {}, callback);
};

exports.isFilesMover = function(obj) {
  return obj === Object(obj) && typeof obj.mover === 'string' && obj.mover == 'appstackr';
};


exports.moveFiles = function (files, options, callback) {


  async.each(Object.keys(files), function (src, next) {

    var _src = resolve(options.srcDir, src);
    var dest = join(options.imgDir, files[src]);

    var readable = fs.createReadStream(_src)
      .on('error', onError(next));
    var writable = fs.createWriteStream(dest)
      .on('error', onError(next))
      .on('finish', function () {
        next();
      });

    readable.pipe(writable);

  }, function(err) {
    callback(err);
  });

  function onError(next) {
    return function(err) {
      next(err);
    }
  }
};