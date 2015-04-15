'use strict';

var fs = require('fs');
var path = require('path'),
    join = path.join;

var expect = require('expect.js');
var utils = require('../lib/utils');
var config = require('../lib/globals').config;

describe('utils', function () {


  describe('browserify()', function () {
    it('should transform ractive template and styles file');
    it('should accept node module path');
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