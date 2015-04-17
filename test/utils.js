'use strict';

var fs = require('fs');
var path = require('path'),
    join = path.join;
var format = require('util').format;

var expect = require('expect.js');
var async = require('async');

var support = require('./support'),
    config = support.config,
    shasum = support.shasumSync;
var utils = require('../lib/utils'),
    browserify = utils.browserify,
    concat = utils.concat,
    cssByFile = utils.cssByFile,
    autoprefixer = utils.autoprefixer,
    uglify = utils.uglify,
    htmlcompressor = utils.htmlcompressor;

describe('utils', function () {


  describe('browserify()', function () {
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
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('ea6b7bc7ac0f876d25ea5431d7b6b106c0e15262');
          done();
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
          fs.createWriteStream(join(__dirname, '..', 'trials', 'ractive.js')).end(codes);
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
          expect(shasum(codes)).to.be('7a17862af07b6757cb542c9c03781eeb3ef3a8b2');
          done();
        }
      );
    });

  });

  describe('concat()', function () {
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

  describe('cssByFile()', function () {
    it('should transform less file to css');
    it('should transform scss file to css');
    it('should transform stylus file to css');
    it('will not change the css file');
  });

  describe('autoprefixer()', function () {
    it('should transform css with vendor prefix');
  });

  describe('uglify()', function () {
    it('should minify js file');
  });


  describe('htmlcompressor()', function () {
    it('should minify .html file');
    it('should minify .swig file');
    it('should minify .ract file');
  });

});