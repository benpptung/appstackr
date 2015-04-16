'use strict';

var fs = require('fs');
var path = require('path'),
    join = path.join;

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
            externals: 'ractive'
          },
          autoprefixer: true
        },
        function (err, codes) {
          expect(err).to.not.be.ok();
          expect(shasum(codes)).to.be('3ad2fdec1a8af29bd92a3701c264dbf8ba6e82df');
          done();
        }
      )
    });

    it('should bundle module from node_modules folders by module resolution semantics', function (done) {

      browserify(
        ['ractive'],
        {
          browserify: {
            exposes: 'ractive'
          }
        },
        function (err, codes) {
          expect(err).to.not.be.ok();
          fs.createWriteStream(join(__dirname, '..', 'trials', 'ractive.js')).end(codes);
          expect(shasum(codes)).to.be('...');
          done();
        }
      );


    });

    it.skip('should bundle specific file or sub module from node_modules folders by module resolution semantics', function (done) {

    });

    it('should expose local file as module');
  });

  describe('concat()', function () {
    it('should concat js and jsx files all together');
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