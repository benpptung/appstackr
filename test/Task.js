/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM12:42
 */

var sinon = require('sinon'),
    Task = require('../lib/Task'),
    profile = require('./support'),
    assert = require('assert');

describe('Task', function () {
  var sandbox,
      stacks;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(console, 'error');
    stacks = require('./fixtures/Task/stacks.json');
  });

  afterEach(function () {
    sandbox.restore();
    stacks = null;
  });

  describe('#create()', function(){
    it('should create task from stack #1', function(done){
      Task.create(stacks.stack1, function(err, task){
        task.name.should.be.equal('todos');
        task.nature.should.be.equal('js');
        task.files.should.have.length(1);
        task.commonjs.should.be.equal('webmake');
        task.concat.should.be.true;
        done();
      })
    });
    it('should create task from stack #2', function(done){
      Task.create(stacks.stack2, function(err, task){
        task.name.should.be.equal('todos');
        task.nature.should.be.equal('css');
        task.files.should.have.length(1);
        assert.equal(task.commonjs, undefined);
        task.concat.should.be.true;
        done();
      })
    });
    it('should create task from stack #3', function(done){
      Task.create(stacks.stack3, function(err, task){
        task.name.should.be.equal('alert');
        task.nature.should.be.equal('jhtml');
        task.files.should.have.length(2);
        assert.equal(task.commonjs, undefined);
        task.concat.should.be.true;
        done();
      })
    });
    it('should create task from stack #4', function(done){
      Task.create(stacks.stack4, function(err, task){
        task.name.should.be.equal('bs');
        task.nature.should.be.equal('js');
        task.files.should.have.length(10);
        assert.equal(task.commonjs, undefined);
        task.concat.should.be.true;
        done();
      })
    });
    it('should create task from stack #5', function(done){
      Task.create(stacks.stack5, function(err, task){
        task.name.should.be.equal('bootstrap');
        task.nature.should.be.equal('css');
        task.files.should.have.length(1);
        assert.equal(task.commonjs, undefined);
        task.concat.should.be.true;
        done();
      })
    });
    it('should create task from stack #6', function(done){
      Task.create(stacks.stack6, function(err, task){
        task.name.should.be.equal('bootstrap-theme');
        task.nature.should.be.equal('css');
        task.files.should.have.length(1);
        assert.equal(task.commonjs, undefined);
        task.concat.should.be.true;
        done();
      })
    });
    it('should callback error, if commonjs stack nature is not js or jhtml', function(done){
      Task.create(stacks.stack8, function(err, task){
        err.should.have.property('message', 'css will not have commonjs interface in stack:impossible-stack');
        done();
      })
    })
  })
});