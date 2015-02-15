/**
 * User: benpptung
 * Date: 2014/2/9
 * Time: PM12:13
 */
var profile = require('./support'),
    tasklist = require('../lib/tasklist'),
    tasks,
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    sinon = require('sinon'),
    sandbox = sinon.sandbox.create(),
    spy;

tasklist.clean();

describe('tasklist', function(){

  beforeEach(function(){
    tasks = require(path.join(__dirname, 'site', 'stacks.js'));
    spy = sandbox.spy(function(done){
      done();
    });
    tasks.forEach(function(task){
      task.run = spy;
      tasklist.addTask(task);
    })
  });

  afterEach(function(){
    tasklist.clean();
    sandbox.restore();
  });

  describe('#addTask()', function(){
    it('callback error if duplicated task found', function(done){
      tasklist.addTask(tasks[1], function(err){
        err.should.have.property('message', 'Task cannot have same name and nature at the same time.');
        done();
      });
    });
  });

  describe('#run()', function(){
    it('could run all if no filter', function(done){
      tasklist.run(function(){
        sinon.assert.callCount(spy, 6);
        done();
      })
    })
    it('could run by app name and duplicated names will run twice', function(done){
      tasklist.run('bootstrap-theme', function(){
        sinon.assert.calledOnce(spy);
        tasklist.run('todos', function(){
          sinon.assert.callCount(spy, 3);
          tasklist.run('alert', function(){
            sinon.assert.callCount(spy, 4);
            tasklist.run('bs', function(){
              sinon.assert.callCount(spy, 5);
              tasklist.run('bootstrap', function(){
                sinon.assert.callCount(spy, 6);
                done();
              })
            })
          })
        })
      })
    });
    it('could run by app nature', function(done){

      tasklist.run('jhtml', function(){
        sinon.assert.calledOnce(spy);
        tasklist.run(('js'), function(){
          sinon.assert.callCount(spy, 3);
          tasklist.run('css', function(){
            sinon.assert.callCount(spy, 6);
            done();
          })
        })
      })

    });

    describe('.errorHandling:', function(){

      it('should warn if no task found', function(done){
        tasklist.run('wrong-name-app', function(err){
          err.should.have.property( 'message', 'no task found: wrong-name-app')
          done();
        });
      });

      it('sould show complete message if no task running error', function(done){
        tasklist.run(done);
      });

      it('should show warning if task.run() callback error', function(done){
        tasklist.addTask({
          name: 'failed-app',
          nature: 'js',
          files: ['client/*.js'],
          run: function(done){
            done('run failed')
          }
        });
        tasklist.run('failed-app', function(err){
          err.should.be.equal('run failed');
          done();
        });
      });
    })
  });

  describe('#rawStacks()', function(){
    it('show warning if stacksfile.js file not found', function(done){
      tasklist.rawStacks(path.join(__dirname, 'fixtures', 'appstack', 'nofile', 'stacksfile.js'), function(err){
        err.should.have.property('code', 'MODULE_NOT_FOUND');
        done();
      });
    });
    it('show warning if stacksfile.js is not an array', function(done){
      tasklist.rawStacks(path.join(__dirname, 'fixtures', 'appstack', 'not-array', 'stacksfile.js'), function(err){
        err.should.have.property('message', 'stacksfile.js is not an array');
        done();
      });
    });
    it('should take raw stacks if it is array type', function(done){
      tasklist.rawStacks(path.join(__dirname, 'fixtures', 'appstack', 'validstacks', 'stacksfile.js'), function(err, stacks){
        stacks.should.be.an.Array.and.an.Object;
        done();
      })
    });
  })
});