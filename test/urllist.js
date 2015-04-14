/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/18
 * Time: PM11:01
 */
var profile = require('./support'),
    utils = require('../lib/utils'),
    urllist = require('../lib/urllist'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    sinon = require('sinon');

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

describe.skip('urllist', function () {
  describe('#urlrefactor()', function () {
    var worker = async.compose(profile.sha1, urllist.urlrefactor, fs.readFile.partial(undefined, 'utf8', undefined));

    it('should refactor urls', function (done) {
      sinon.stub(utils, 'log');

      // put path pairs into urllist
      path_pairs.forEach(function (pair) {
        urllist.pair(pair);
      })
      // transform the content
      worker(viewfile, function (err, hash) {
        if (err) console.error(prettyjson.render(err));
        sinon.assert.calledWithExactly(utils.log, 'might be broken link: /asset/vendor/backbone.localStorage-fake.js');
        hash.should.be.equal(correct_hash);

        // restore stub and done.
        utils.log.restore();
        done();
      })

    });
  });
});

