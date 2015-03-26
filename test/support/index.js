/**
 * User: benpptung
 * Date: 2014/2/8
 * Time: PM7:01
 */

var path = require('path'),
    async = require('async'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    cwd_profile = path.join(__dirname, '..', 'site'),
    crypto = require('crypto');

// make profile to see process.cwd() in the test/site directory
process.chdir(cwd_profile);

var support = module.exports = require('../../lib/globals/config');

var viewsReg = new RegExp(RegExp.quote(support.views) + "(.+)$"),
    publicReg = new RegExp(RegExp.quote(support.public) + "(.+)$");

/**
 *
 * @param content
 * @param callback
 */
support.sha1 = function(content, callback){
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

support.moveDistFiles = function(callback){
  var viewstask = {
        findpath: path.join(support.views, '**', '*.*'),
        name : 'views'
      },
      publictask = {
        findpath: path.join(support.public, '**', '*.*'),
        name: 'public'
      },
      worker = function(task, done){
        glob(task.findpath, function(err, files){
          async.each(files, function(file, next){
            var dirpath = task.filename == 'views' ? support.distViews : support.distPublic,
                reg = task.filename == 'views' ? viewsReg : publicReg,
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