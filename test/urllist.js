/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/18
 * Time: PM11:01
 */
var path = require('path');
var fs = require('fs');

var expect = require('expect.js');
var async = require('async');

var support = require('./support'),
    shasum = support.shasum,
    config = support.config;
var utils = require('../lib/utils');
var urllist = require('../lib/urllist');

var viewfile = path.join(__dirname, 'fixtures', 'urllist', 'todo.html');
correct_hash = '32646c187db466d5519c9436a371257f9c67e1cb';

var path_pairs = [
  { localUrl: '/asset/vendor/json2.js', cdnUrl: 'http://s3.icartoon.me/asset/vendor/json2-fdafds.js'},
  { localUrl: '/asset/todos.min.css', cdnUrl: 'http://s3.icartoon.me/todos.min-1du3ds3.css'},
  { localUrl: '/asset/vendor/jquery.js', cdnUrl: 'http://s3.icartoon.me/asset/vendor/jquery-t5d34d.js'},
  { localUrl: '/asset/vendor/underscore.js', cdnUrl: 'http://s3.icartoon.me/asset/vendor/underscore-fdsfsd.js'},
  { localUrl: '/asset/vendor/backbone.js', cdnUrl: 'http://s3.icartoon.me/asset/vendor/backbone-32f324.js'},
  { localUrl: '/js/todos.min.js', cdnUrl: 'http://s3.icartoon.me/js/todos.min-23resdf.js'}
];

describe('urllist', function () {
  describe('#urlrefactor()', function () {
    var worker = async.compose(shasum, urllist.urlrefactor, fs.readFile.partial(undefined, 'utf8', undefined));
    var logger = utils.message;
    var warning = config.warning;

    beforeEach(function () {
      utils.message = mock_logger();
      config.warning = true;
    });

    afterEach(function () {
      utils.message = logger;
      config.warning = warning;
    });


    it('should refactor urls', function (done) {

      // put path pairs into urllist
      path_pairs.forEach(function (pair) {
        urllist.pair(pair);
      });
      // transform the content
      worker(viewfile, function (err, hash) {
        if (err) console.error(prettyjson.render(err));
        expect(utils.message._message).to.be('might be broken link: \u001b[35m/asset/vendor/backbone.localStorage-fake.js\u001b[39m');
        expect(hash).to.be(correct_hash);
        done();
      })

    });
  });
});

var mock_logger = function () {
  var fn = function (msg) {
    fn._message = msg;
  };
  return fn;
};