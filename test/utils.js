'use strict';

var fs = require('fs');
var path = require('path'),
    join = path.join;
var format = require('util').format;

var expect = require('expect.js');
var async = require('async');

/// testenv should always be the first local imported module to set up test env
var testenv = require('./testenv'),
    config = testenv.config,
    shasum = testenv.shasumSync;
var utils = require('../lib/utils'),
    browserify = utils.browserify,
    concat = utils.concat,
    cssByFile = utils.cssByFile,
    autoprefixer = utils.autoprefixer,
    uglify = utils.uglify,
    htmlcompressor = utils.htmlcompressor;

describe('utils', function () {


  describe('#browserify()', function () {
    it('should transform ractive template and styles file', function (done) {
      browserify(
        [join(__dirname, 'fixtures', 'files', 'ractive', 'index.js')],
        {
          browserify: {
            externals: 'ractive',
            exposes: 'index.js:alice'
          },
          autoprefixer: true
        },
        function (err, codes) {

          try {
            expect(err).to.not.be.ok();
            expect(shasum(codes)).to.be('89cfe92668352998551e443dcbf289b40aab2d36');
            done();
          }
          catch (err) { done(err)}
        }
      )
    });

    it('should bundle module from node_modules folders by module resolution semantics', function (done) {

      browserify(
        ['ractive'],
        {
          browserify: {
            exposes: 'ractive',
            noParse: ['ractive']
          }
        },
        function (err, codes) {
          expect(err).to.not.be.ok();
          // browserify 10.1.0 - 88afd029486547a46ae3d2b1a705ace918d2174f
          // browserify 10.1.3 - 88afd029486547a46ae3d2b1a705ace918d2174f
          // browserify 10.2.4 - cfd6738c99bdf9401a5f335a9673ac63f95d6001
          expect(shasum(codes)).to.be('88afd029486547a46ae3d2b1a705ace918d2174f');
          done();
        }
      );
    });

    it('should bundle specific file or sub module from node_modules folders by module resolution semantics', function (done) {

      var old = utils.warn;
      utils.warn = function (message) {
        expect(message).to.match(/^exposes:/);
      };
      browserify(
        ['ractive/ractive-legacy.runtime.min'],
        {
          browserify: {
            exposes: 'ractive',
            noParse: ['ractive/ractive-legacy.runtime.min.js']
          }
        },
        function (err, codes) {
          utils.warn = old;
          expect(err).to.not.be.ok();
          // browserify 10.1.0 - 7a17862af07b6757cb542c9c03781eeb3ef3a8b2
          // browserify 10.1.3 - 7a17862af07b6757cb542c9c03781eeb3ef3a8b2
          // browserify 10.2.4 - f1859dded996276a639fe8be4e9a4e9ef9f9710b
          expect(shasum(codes)).to.be('7a17862af07b6757cb542c9c03781eeb3ef3a8b2');
          done();
        }
      );
    });

  });

  describe('#concat()', function () {
    it('should concat js and jsx files all together', function (done) {
      concat(
        [
          join(__dirname, 'fixtures', 'files', 'js', 'plainjs-foo.js'),
          join(__dirname, 'fixtures', 'files', 'jsx', 'react-todos.jsx')
        ],
        function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('fc3298751633afc293ca81dd9a6e90afb5f57381');
          done();
        }
      );
    });
  });

  describe('#cssByFile()', function () {
    it('should transform less file to css', function(done) {
      cssByFile(
        join(__dirname, 'fixtures', 'files', 'less', 'start.less'),
        function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('64d52870656064736b0a196179f95cda2dd4f128');
          done();
        }
      )
    });

    it('should transform scss file to css', function (done) {
      cssByFile(
        join(__dirname, 'fixtures', 'files', 'scss', 'ui.scss'),
        function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('bd8a11cfb3f400863a6de78e0244ca2b006e7700');
          done();
        }
      )
    });

    it('should transform stylus file to css', function (done) {
      cssByFile(
        join(__dirname, 'fixtures', 'files', 'stylus', 'start.styl'),
        function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('49efeea24d1c95b12800d53b976f65942ffeabe2');
          done();
        }
      )
    });
    it('will not change the css file', function (done) {
      cssByFile(
        join(__dirname, 'fixtures', 'files', 'css', 'cover.css'),
        function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('fd2296e62fe7b044c1c821a54e47feae71698f4d');
          done();
        }
      )
    });
  });

  describe('#autoprefixer()', function () {
    it('should transform css with vendor prefix', function (done) {
      cssByFile(join(__dirname, 'fixtures', 'files', 'ractive', 'ui.scss'), function(err, codes) {
        autoprefixer(codes, true, function(err, codes) {

          try {
            expect(err).to.not.be.ok();
            // autoprefixer 5.1.x: 73740997afe1c7021d60cb79286700031790b675
            // postcss@4.2.11 + autoprefixer-core@5.2.0 c8b35f6e5dc32e183db115892fa7144dd029c211
            expect(shasum(codes)).to.be('ad82b4716de4a5280685dfae2e04614e27d6cab0');

            done();
          }
          catch (err) {
            done(err);
          }
        })
      });
    });
  });

  describe('#uglify()', function () {
    it('should minify js file', function(done) {
      fs.readFile(join(__dirname, 'fixtures', 'files', 'js', 'ractive-legacy.js'), function (err, codes) {
        uglify(codes, function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('10c25a29aef410d883b03f9b0a13cde7b0a13d02');
          // uglify-js@2.4.16 0e35b7047fc4a39b38e3aca80c7f07d5965ffbe6
          // uglify-js@2.4.20 4057d594b742043c653747a8d444e7697cf27c60
          // uglify-js@2.4.21 a0605a32a840dea85f64b8108115301626752cbe
          // uglify-js@2.4.23 10c25a29aef410d883b03f9b0a13cde7b0a13d02
          done();
        });
      })
    });
  });


  describe('#htmlcompressor()', function () {

    var old;

    beforeEach(function () {
      old = config.viewJsMini;
      config.viewJsMini = true;
    });

    afterEach(function () {
      config.viewJsMini = old;
    });

    it('should minify .html file', function(done) {
      fs.readFile(join(__dirname, 'fixtures', 'files', 'tmpl', 'base.html'), function (err, codes) {
        htmlcompressor(codes, function(err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('fa7d3b41ec89b13dfa6bd5c153e92c439173b440');
          done();
        })
      })
    });

    it('should minify .swig file', function (done) {
      fs.readFile(join(__dirname, 'fixtures', 'files', 'tmpl', 'index.swig'), function (err, codes) {
        htmlcompressor(codes, function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('0bb4fd8feff827b725bc161667017a56248007c7');
          done();
        })
      });
    });
    it('should minify .ract file', function (done) {
      fs.readFile(join(__dirname, 'fixtures', 'files', 'tmpl', 'ui.ract'), function (err, codes) {
        htmlcompressor(codes, function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('53c6bf59009c8858bd662889b51372deb8d46a13');
          done();
        })
      })
    });
  });

});