/**
 * User: benpptung
 * Date: 2014/2/8
 * Time: PM7:01
 */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var async = require('async');
var glob = require('glob');
var mkdirp = require('mkdirp');

var cwd_site = path.join(__dirname, '..', 'site');

// make profile to see process.cwd() in the test/site directory
process.chdir(cwd_site);
var config = module.exports = require('../../lib/globals/config');

var viewsReg = new RegExp(RegExp.quote(config.views) + "(.+)$"),
    publicReg = new RegExp(RegExp.quote(config.public) + "(.+)$");

/**
 *
 * @param content
 * @param callback
 */
config.sha1 = function(content, callback){
  var hash, buffs = [], ended = false;

  hash = crypto.createHash('sha1');
  hash.on('data', function(chunk){
    buffs.push(chunk);
  });
  hash.on('error', function(err){
    if (!ended) {
      ended = true;
      callback('hash error:' + err);
    }
  });
  hash.on('end', function(){
    if (!ended) {
      ended = true;
      callback(null, Buffer.concat(buffs).toString('hex'));
    }
  });
  hash.end(content);
};

config.moveDistFiles = function(callback){
  var viewstask = {
        findpath: path.join(config.views, '**', '*.*'),
        name : 'views'
      },
      publictask = {
        findpath: path.join(config.public, '**', '*.*'),
        name: 'public'
      },
      worker = function(task, done){
        glob(task.findpath, function(err, files){
          async.each(files, function(file, next){
            var dirpath = task.name == 'views' ? config.distViews : config.distPublic,
                reg = task.name == 'views' ? viewsReg : publicReg,
                dest = path.join(dirpath, file.match(reg)[1]);

            mkdirp(path.dirname(dest), function(){
              var readstream = fs.createReadStream(file),
                  writestream = fs.createWriteStream(dest);
              readstream.pipe(writestream);
              next();
            })

          }, done);
        })
      },
      factory = async.queue(worker);

  factory.push(viewstask);
  factory.push(publictask);
  factory.drain = callback;
};