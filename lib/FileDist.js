/**
 * User: benpptung
 * Date: 2014/2/7
 * Time: AM10:04
 */

var profile = require('./profile'),
    utils = require('./utils'),  // provide RegExp.quote()
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    crc32 = require('buffer-crc32'),
    extend = require('node.extend'),
    async = require('async'),
    urllist = require('./urllist'),
    mkdirp = require('mkdirp'),
    htmlcompressor = utils.htmlcompressor,
    urlrefactor = urllist.urlrefactor;

// static variables
var viewsReg = new RegExp(RegExp.quote(profile.views) + "(.+)$"),
    publicReg = new RegExp(RegExp.quote(profile.public) + "(.+)$"),
    cdnUrl = url.parse(profile.cdn, false, true),
    dirprop;

exports.setDirProp = function (dir) {
  dirprop = dir;
};

/**
 *
 * @param {string} file
 * @param {string} type
 * @param callback
 */
exports.create = function (file, type, callback) {
  var filedist = new FileDist(file, type),
      basename_hash;

  // async build the filedist from reading the file and create the hash to add
  if (filedist.addhash) {
    fs.readFile(file, function (err, buff) {
      if (err) return callback(err);

      // add urllist record for refactor
      basename_hash = crc32.unsigned(buff).toString(36);
      urllist.pair(urlpair.call(filedist, basename_hash));
      // add hash tag to basename for writing the file to new distination
      filedist.basename = filedist.basename + '-' + basename_hash;
      // to avoid too much memory usage, avoid to save the buff now
      callback(null, filedist);
    });
    return; // ending the block
  }

  // generate the urlpair directly, if it is not a view file
  if (type != 'views'){
    urllist.pair(urlpair.call(filedist));
  }
  callback(null, filedist);
};

/**
 *
 * @param file
 * @param type
 * @constructor
 */
function FileDist(file, type) {
  extend(this, dirprop(type));
  this.file = file;
  // separate the extname and basename to add version hash
  this.extname = path.extname(this.file);
  this.basename = path.basename(this.file, this.extname);
  // calculate the relpath and fs relpath
  this.relPath = type == 'views' ? path.dirname(file.match(viewsReg)[1]) : path.dirname(file.match(publicReg)[1]);
  this.relPathFS = this.relPath;
  // edit the relPath due to win32 file system
  if (process.platform == 'win32') this.relPath = this.relPath.replace(new RegExp(RegExp.quote('\\'), 'g'), '/');
}

FileDist.prototype.run = function (callback) {
  // compose and bind the functions back to this
  this._runner = async.compose(writefile, mkdir, refactorurl, htmlmini, fs.readFile);
  this._runner(this.file, callback);
};

// transformers

var htmlmini = function (buff, next) {
  // Only directory property own htmlmini and we setup view mini we start htmlcompressor
  if (!this.htmlmini || !profile.viewMini) return next(null, buff);
  htmlcompressor(buff.toString('utf8'), next);
};

var refactorurl = function (buff, next) {
  if (!this.refactor) return next(null, buff);
  urlrefactor(buff.toString('utf8'), next);
};

var mkdir = function (buff, next) {
  mkdirp(path.join(this.distDirPath, this.relPathFS), function (err) {
    next(err, buff);
  })
};

var writefile = function (buff, next) {
  fs.writeFile(path.join(this.distDirPath, this.relPathFS, this.basename + this.extname), buff, next);
};

/**
 *
 * @param {String|undefined} file_hash
 * @returns {{localUrl: string, cdnUrl: string}}
 */
var urlpair = function(file_hash){
  var hash = file_hash ? '-' + file_hash : '',
      urlobj = {
    protocol: cdnUrl.protocol,
    host: cdnUrl.host,
    pathname: path.join(cdnUrl.pathname, this.relPath, this.basename + hash + this.extname)
  };

  return {
    localUrl: path.join(this.relPath, this.basename + this.extname),
    cdnUrl: url.format(urlobj)
  }
};
