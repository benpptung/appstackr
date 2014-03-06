/**
 * User: benpptung
 * Date: 2014/2/7
 * Time: PM5:11
 */

var profile = require('./profile'),
    glob = require('glob'),
    async = require('async'),
    path = require('path'),
    FileDist = require('./FileDist');

/**
 *
 * @namespace
 * @property {Array} dirs
 */
var dirprop = module.exports = function(type){
  return props[type];
};

Object.defineProperty(dirprop, 'dirs', {
  configurable: false,
  enumerable: true,
  get: function(){
    return Object.keys(props);
  }
});

FileDist.setDirProp(dirprop);

/**
 *
 * @param {string} directory_key
 * @param callback
 */
dirprop.distfiles = function(directory_key, callback){
  var patterns = [];

  switch (directory_key){
    case 'views':
      profile.viewEngines.forEach(function(ext_name){
        patterns.push('*' + ext_name);
      })
      break;
    case 'js':
      patterns.push('*.js');
      patterns.push('*.json');
      break;
    case 'css':
      patterns.push('*.css');
      break;
    case 'img':
    case 'asset':
    default:
      patterns.push('*.*');
      break;
  }

  async.concat(patterns, function(pattern, done){
    pattern = path.join(profile[directory_key], '**', pattern);

    glob(pattern, function(err, files){
      if (err) return done(err);
      async.filter(files, filter, function(files){
        done(null, files);
      });
    });

  }, createDistFile);

  function filter(file, done){
    done(!profile.excludes.test(file));
  }

  function createDistFile(err, files){
    if (err) return callback(err);
    async.map(files, FileDist.create.partial(undefined, directory_key, undefined), callback);
  }
};

dirprop.publicDirsRelPath = function(){
  var dirkeys = Object.keys(props),
      dir_rel_paths = [],
      public_dir_reg = new RegExp(RegExp.quote(profile.public) + "(.+)$");

  dirkeys.forEach(function(key){
    if (props[key].isPublic){
      dir_rel_paths.push(profile[key].match(public_dir_reg)[1]);
    }
  });
  return dir_rel_paths;
};

var props = {

  views: {
    addhash:     false,
    refactor:    true,
    htmlmini:    true,
    distDirPath: profile.distViews,
    isPublic: false
  },

  js: {
    addhash:     true,
    refactor:    false,
    htmlmini:    false,
    distDirPath: profile.distPublic,
    isPublic:    true
  },

  css: {
    addhash:     true,
    refactor:    true,
    htmlmini:    false,
    distDirPath: profile.distPublic,
    isPublic:    true
  },

  img: {
    addhash:     true,
    refactor:    false,
    htmlmini:    false,
    distDirPath: profile.distPublic,
    isPublic:    true
  },

  asset: {
    addhash:     false,
    refactor:    false,
    htmlmini:    false,
    distDirPath: profile.distPublic,
    isPublic:    true
  }
};
