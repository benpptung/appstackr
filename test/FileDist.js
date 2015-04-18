/**
 * User: benpptung
 * Date: 2014/2/8
 * Time: PM5:41
 */

var path = require('path');

var async = require('async');
var expect = require('expect.js');

/// testenv should always be the first local imported module to set up test env
var testenv = require('./testenv'),
    config = testenv.config;
var dirprop = require('../lib/dirprop');
var urllist = require('../lib/urllist');
var utils = require('../lib/utils');
var FileDist = require('../lib/FileDist');


describe('FileDist', function () {
  describe('#create()', function () {

    var files = [
      { type: 'css', file: path.join(__dirname, 'site', 'public', 'css', 'bootstrap.min.css')},
      { type: 'views', file: path.join(__dirname, 'site', 'views', 'todo.html')},
      { type: 'js', file: path.join(__dirname, 'site', 'public', 'js', 'todos.min.js')}
    ];

    it('save urlpair to urllist', function (done) {
      var _pair = urllist.pair;
      var pairUrl = false;

      urllist.pair = function (pair) {
        pairUrl = pair;
      };

      var worker = function (task, next) {
        FileDist.create(task.file, task.type, next);
      };

      var queue = async.queue(worker, 3);
      queue.drain = function () {
        urllist.pair = _pair;
        done();
      };

      queue.push(files[0], function () {
        expect(pairUrl).to.eql({ localUrl: '/css/bootstrap.min.css',
          cdnUrl: '//s3.icartoon.me/css/bootstrap.min-1olc5sf.css'});
      });

      queue.push(files[1], function () {
        //pairUrl.should.be.false;
        expect(pairUrl).to.be(false);
      });

      queue.push(files[2], function () {
        expect(pairUrl).to.eql({ localUrl: '/js/todos.min.js',
          cdnUrl: '//s3.icartoon.me/js/todos.min-1nb1p7g.js'});
      })

    })
  });

  describe('#relPath', function () {
    it('should return correct absolute relPath of the file for src, href, url in html and css', function (done) {
      var file = path.join(__dirname, 'site', 'public', 'asset', 'vendor', 'backbone.js');
      FileDist.create(file, 'asset', function (err, filedist) {
        expect(filedist.relPath).to.be('/asset/vendor');
        done();
      })
    });
    it('should return correct file system relPathFS of the file for file moving', function (done) {
      var file = path.join(__dirname, 'site', 'public', 'asset', 'vendor', 'backbone.js');
      FileDist.create(file, 'asset', function (err, filedist) {
        var relpathFS = process.platform == 'win32' ? '\\asset\\vendor' : '/asset/vendor';
        expect(filedist.relPathFS).to.be(relpathFS);
        done();
      })
    })
  });

  describe('#run()', function () {
    var files = [
          { type: 'css', file: path.join(__dirname, 'site', 'public', 'css', 'bootstrap.min.css')},
          { type: 'views', file: path.join(__dirname, 'site', 'views', 'todo.html')},
          { type: 'js', file: path.join(__dirname, 'site', 'public', 'js', 'todos.min.js')}
        ];
    var brokenlinks = [];
    var _message = utils.message;
    var _warning = config.warning;

    beforeEach(function () {
      config.warning = true;
    });

    afterEach(function () {
      config.warning = _warning;
    });


    utils.message = function(message){
      brokenlinks.push(message);
    };

    it('should be able move file to dist folder', function (done) {
      async.each(files, function (task, next) {
        FileDist.create(task.file, task.type, function (err, filedist) {
          filedist.run(next);
        });
      }, function(){
        //brokenlinks.should.have.length(4);
        expect(brokenlinks).to.have.length(4);
        utils.clean('build', function(){
          utils.message = _message;
          done();
        });
      });
    });
  })
});
