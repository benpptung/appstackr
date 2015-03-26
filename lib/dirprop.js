/**
 * User: benpptung
 * Date: 2014/2/7
 * Time: PM5:11
 */
var path = require('path');

var glob = require('glob');
var async = require('async');

var config = require('./globals').config;
var FileDist = require('./FileDist');

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
      config.viewEngines.forEach(function(ext_name){
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
    pattern = path.join(config[directory_key], '**', pattern);

    glob(pattern, function(err, files){
      if (err) return done(err);
      async.filter(files, filter, function(files){
        done(null, files);
      });
    });

  }, createDistFile);

  function filter(file, done){
    done(!config.excludes.test(file));
  }

  function createDistFile(err, files){
    if (err) return callback(err);
    async.map(files, FileDist.create.partial(undefined, directory_key, undefined), callback);
  }
};

dirprop.publicDirsRelPath = function(){
  var dirkeys = Object.keys(props),
      dir_rel_paths = [],
      public_dir_reg = new RegExp(RegExp.quote(config.public) + "(.+)$");

  dirkeys.forEach(function(key){
    if (props[key].isPublic){
      dir_rel_paths.push(config[key].match(public_dir_reg)[1]);
    }
  });
  return dir_rel_paths;
};

var props = {

  views: {
    addhash:     false,
    refactor:    true,
    htmlmini:    true,
    distDirPath: config.distViews,
    isPublic: false
  },

  js: {
    addhash:     true,
    refactor:    false,
    htmlmini:    false,
    distDirPath: config.distPublic,
    isPublic:    true
  },

  css: {
    addhash:     true,
    refactor:    true,
    htmlmini:    false,
    distDirPath: config.distPublic,
    isPublic:    true
  },

  img: {
    addhash:     true,
    refactor:    false,
    htmlmini:    false,
    distDirPath: config.distPublic,
    isPublic:    true
  },

  asset: {
    addhash:     false,
    refactor:    false,
    htmlmini:    false,
    distDirPath: config.distPublic,
    isPublic:    true
  }
};
