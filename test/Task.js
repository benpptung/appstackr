'use strict';

var expect = require('expect.js');

var testenv = require('./testenv');
var create = require('../lib/Task').create;

describe('Task', function () {

  describe('create task by stack', function() {

    var stacks = require('./fixtures/Task/stacks.json');

    it('should create task by stack', function(done) {
      create(stacks.stack1, function(err, task) {
        expect(err).to.not.be.ok();
        expect(task.filename).to.be('todos');
        expect(task.nature).to.be('js');
        expect(task.files).to.have.length(4);
        expect(task.commonjs).to.be.ok();
        expect(task.concat).to.be(true);
        expect(task.browserify).to.be(undefined);
        expect(task.autoprefixer).to.be(true);
        expect(task.ext).to.be(undefined);
        expect(task.watch).to.be(undefined);
        expect(task._patterns).to.be.eql(['client/todo/**/*.*']);
        expect(task._stack_files).to.be.eql(['client/todo/**/*.*']);
        expect(task._stack).to.be(stacks.stack1);
        done();
      });
    });

    it('should create task if typeof stack.files == \'string\'', function(done) {
      create(stacks.stack4, function(err, task) {
        expect(task.files).to.have.length(10);
        expect(task._stack_files).to.have.length(1);
        expect(task._patterns).to.have.length(1);
        done();
      })
    });

    it('should set task.commonjs === true if stack.browserify is truthy', function(done) {
      create(stacks.stack3, function(err, task) {
        expect(task.commonjs).to.be(true);
        done();
      })
    });

    it('should set task.autoprefixer === false if stack.autoprefixer is false', function(done) {
      create(stacks.stack2, function(err, task) {
        expect(task.autoprefixer).to.be(false);
        done();
      })
    });

    it('should callback error, if stack.commonjs is truthy, but nature is not js|jhtml', function(done) {
      create(stacks.stack8, function(err) {
        expect(err).to.have.property('message', 'css will not have commonjs interface in stack:impossible-stack');
        done();
      });
    });

    it('callback error, if stack.browserify is truthy, but nature is not js|jhtml', function(done) {
      create(stacks.stack9, function(err) {
        expect(err).to.have.property('message', 'css will not have commonjs interface in stack:impossible-stack');
        done();
      })
    });

    it('set concat as false, if view stack.concat === false', function(done) {
      create(stacks['view-non-concat'], function(err, task) {
        expect(task.concat).to.be(false);
        done();
      })
    });

    it('view stack\'s concat defaults to true', function(done) {
      create(stacks['view-concat'], function(err, task) {
        expect(task.concat).to.be(true);
        expect(task.ext).to.be('.html');
        done();
      })
    })
  })
});