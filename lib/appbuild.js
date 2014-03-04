var profile = require('./profile'),
    utils = require('./utils'),
    async = require('async'),
    dirprop = require('./dirprop');

/**
 *
 * @param {Object} options - tasklist final successful or failed.
 * @param {Function} callback
 */
module.exports = function (options, callback) {
  utils.log('starting appbuild ...');

  // main steps
  async.waterfall([
    async.concat.partial(['views', 'js', 'css', 'img', 'asset'], dirprop.distfiles, undefined),
    clean,
    async.eachLimit.partial(undefined, profile.distLimit, filedist_runner, undefined)
  ], function(err){
    if (err) return utils.error(err);
    return utils.log('building successful.') || callback();
  });

  // helpers
  function clean (distfiles, next){
    utils.log('cleanning files in dist directories');
    utils.clean('build', function(err){
      if (err) return next(err);
      utils.log('distfiles built, starting distribution');
      next(null, distfiles);
    })
  }
  function filedist_runner (filedist, next){
    filedist.run(next);
  }
};

