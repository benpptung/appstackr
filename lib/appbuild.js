var config = require('./globals').config,
    utils = require('./utils'),
    async = require('async'),
    dirprop = require('./dirprop');

/**
 *
 * @param {Object} options - tasklist final successful or failed.
 * @param {Function} callback
 */
//module.exports = function (options, callback) {
module.exports = function(callback) {
  utils.message('starting appbuild ...');

  // main steps
  async.waterfall([
    async.concat.partial(['views', 'js', 'css', 'img', 'asset'], dirprop.distfiles, undefined),
    clean,
    async.eachLimit.partial(undefined, config.distLimit, filedist_runner, undefined)
  ], function(err){
    if (err) return utils.warn(err);
    return utils.message('building successful.') || callback();
  });

  // helpers
  function clean (distfiles, next){
    if (!config.cleanDist) return next(null, distfiles);
    utils.message('cleanning files in dist directories');
    utils.clean('build', function(err){
      if (err) return next(err);
      utils.message('distfiles built, starting distribution');
      next(null, distfiles);
    })
  }
  function filedist_runner (filedist, next){
    filedist.run(next);
  }
};

