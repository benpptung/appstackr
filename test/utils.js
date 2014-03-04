var profile = require('./support'),
    utils = require('../lib/utils'),
    webmake = utils.webmake,
    browserify = utils.browserify,
    concat = utils.concat,
    css = utils.css,
    uglify = utils.uglify,
    cleanCSS = utils.cleanCSS,
    ycssmin = utils.ycssmin,
    htmlcompressor = utils.htmlcompressor,
    clean = utils.clean,
    path = require('path'),
    fs = require('fs'),
    sinon = require('sinon'),
    glob = require('glob'),
    sha1 = profile.sha1,
    async = require('async'),
    prettyjson = require('prettyjson');

var webmake_file_hash = '405f15753e5e9b525bcc0ff29c67ba06748d0c53',
    webmake_files_hash = 'd22461f89f22204278bd22fd21aa06d2babb51a5',
    browserify_file_hash = '5e372ed784133892007ff3bb7240b8f34b39a497',
    browserify_files_hash = '7137e1ea4841dd91c3f7be7f2bf3e03cba744ac6',
    concat_files_hash = '5513854f28f4c426832b3832acb42bc4006d527a',
    css_lessfile_hash = '904fc52b973fecb657dedf20554f4e1c0846d2fd',
    css_lessfiles_hash = 'a15c2080224887c358ca1cefc74c3c1b2fce2ccb',
    css_lesscss_hash = '2676928e861685157761ddac3c58b12cdfa0a992',
    minified_css_beautify_hash = '2676928e861685157761ddac3c58b12cdfa0a992',
    minified_cleancss_hash = 'd6faa3c3ba5cdfa741d1607a11e06831c6ea9802',
    minified_ycssmin_hash = 'd176de20cc45dc1dcf89f08025db1c4941794a01',
    uglify_beautify_hash= 'ff82929e01ec9e40fc3a3ab911a66fd2407bc24c',
    uglify_minify_hash = '7dacd73b4309abd69003f31e3d51d4a8e303565b',
    htmlcompressor_theme_hash = '4373fb857cd39a5ab46ef7fcd3ac105d5eebdf12',
    htmlcompressor_layout_hash = 'c167db2bb4c09360ac847023c9a5542d63e36cf6',
    htmlcompressor_head_hash = '39474553fead2376a223989409c92a248a7dcc86',
    htmlcompressor_login_hash = '2ff8213625d941c508dec311eb4d41fd766001a9',
    htmlcompressor_foot_hash = '407bba0586b78a9159c780876977a7790d012c5e';

var main = path.join(__dirname, 'fixtures', 'utils', 'commonjs', 'main.js'),
    main2 = path.join(__dirname, 'fixtures', 'utils', 'commonjs', 'main2.js'),
    bootstrap_file = path.join(__dirname, 'fixtures', 'utils', 'less', 'bootstrap.less'),
    theme_file = path.join(__dirname, 'fixtures', 'utils','less', 'theme.less'),
    css_file = path.join(__dirname, 'fixtures', 'utils', 'css', 'cssmini.css'),
    file_alert = path.join(__dirname, 'fixtures', 'utils', 'generic', 'alert.js'),
    file_trans = path.join(__dirname, 'fixtures', 'utils', 'generic', 'transition.js'),
    swig_theme = path.join(__dirname, 'fixtures', 'utils', 'views', 'bootstrap-theme.html'),
    swig_layout = path.join(__dirname, 'fixtures', 'utils', 'views', 'layout.html'),
    ejs_head = path.join(__dirname, 'fixtures', 'utils', 'views', 'head.ejs'),
    ejs_login = path.join(__dirname, 'fixtures', 'utils', 'views', 'login.ejs'),
    ejs_foot = path.join(__dirname, 'fixtures', 'utils', 'views', 'foot.ejs');

describe('utils', function(){
  describe('Function.prototype.partial()', function(){
    it('closure created by partial could be called many times.', function(){
      var add = function(a, b, c){
            return a + b + c;
          }, fn = add.partial(undefined, 3, undefined);

      fn(1, 2).should.be.equal(6);
      fn(2, 3).should.be.equal(8);
    });
  });

  describe('#webmake()', function(){
    var runner = async.compose(sha1, webmake);

    it('could convert commonjs linked files into one', function(done){
      runner([main], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(webmake_file_hash);
        done();
      })
    });
    it('could accept multiple commonjs files as entry points', function(done){
      runner([main, main2], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(webmake_files_hash);
        done();
      });
    });
  });

  describe('#browserify()', function(){
    var runner = async.compose(sha1, browserify);

    it('could convert commonjs linked files into one', function(done){
      runner([main], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(browserify_file_hash);
        done();
      })
    });
    it('could accept multiple commonjs files as entry points', function(done){
      runner([main, main2], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(browserify_files_hash);
        done();
      })
    })
  });

  describe('#css()', function(){
    var runner = async.compose(sha1, css);

    it('could render less file to css', function(done){
      runner([bootstrap_file], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(css_lessfile_hash);
        done();
      })
    });
    it('could render multiple less file into css', function(done){
      runner([bootstrap_file, theme_file], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(css_lessfiles_hash);
        done();
      })
    });
    it('could concat css file to less rendered css file', function(done){
      runner([bootstrap_file, theme_file, css_file], function(err, hash){
        hash.should.be.equal(css_lesscss_hash);
        done();
      })
    });
  });

  describe('#concat()', function(){
    it('could concat multiple files into one', function(done){
      var runner = async.compose(sha1, concat);

      runner([file_trans, file_alert], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(concat_files_hash);
        done();
      })
    });
  });

  describe('#ugilify()', function(){
    var runner = async.compose(sha1, uglify, concat);
    it('could minify js codes', function(done){
      profile.beautify = false;
      runner([file_trans, file_alert], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(uglify_minify_hash);
        done();
      })
    });
    it('accept profile.beautify to minify js codes', function(done){
      profile.beautify = true;
      runner([file_trans, file_alert], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(uglify_beautify_hash);
        done();
      })
    });
  });

  describe('#cleanCSS()', function(){
    var runner = async.compose(sha1, cleanCSS, css);

    it('minify css codes', function(done){
      profile.beautify = false;
      runner([bootstrap_file, theme_file, css_file], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(minified_cleancss_hash);
        done();
      })
    });
    it('skip css minify if profile.beautify equal true', function(done){
      profile.beautify = true;
      runner([bootstrap_file, theme_file, css_file], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(minified_css_beautify_hash);
        profile.beautify = false;
        done();
      })
    })
  });

  describe('#ycssmin()', function(){
    var runner = async.compose(sha1, ycssmin, css);

    it('minify css codes', function(done){
      profile.beautify = false;
      runner([bootstrap_file, theme_file, css_file], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(minified_ycssmin_hash);
        done();
      })
    });
    it('skip css minify if profile.beautify equal true', function(done){
      profile.beautify = true;
      runner([bootstrap_file, theme_file, css_file], function(err, hash){
        if (err) return done(err);
        hash.should.be.equal(minified_css_beautify_hash);
        profile.beautify = false;
        done();
      })
    })
  });

  describe('#htmlcompressor()', function(){
    var _viewjsmini = profile.viewJsMini,
        _viewcssmini = profile.viewCSSMini,
        runner = async.compose( sha1 , htmlcompressor, fs.readFile.partial(undefined, 'utf8', undefined));


    beforeEach(function(){
      profile.viewCSSMini = true;
      profile.viewJsMini = true;
    });
    afterEach(function(){
      profile.viewCSSMini = _viewcssmini;
      profile.viewJsMini = _viewjsmini;
    })

    it('compress django style html template', function(done){
      async.mapSeries([swig_layout, swig_theme], runner, function(err, hashes){
        if (err) {
          console.error(prettyjson.render(err));
        }
        hashes[0].should.be.equal(htmlcompressor_layout_hash);
        hashes[1].should.be.equal(htmlcompressor_theme_hash);
        done();
      })

    });
    it('compress ejs html template', function(done){
      async.mapSeries([ejs_head, ejs_login, ejs_foot], runner, function(err, hashes){
        if (err) {
          console.error(prettyjson.render(err));
        }
        hashes[0].should.be.equal(htmlcompressor_head_hash);
        hashes[1].should.be.equal(htmlcompressor_login_hash);
        hashes[2].should.be.equal(htmlcompressor_foot_hash);
        done();
      })
    });
  })

  describe('#clean()', function(){

    beforeEach(function(){
      sinon.stub(utils, 'log');
    });
    afterEach(function(){
      utils.log.restore();
    });

    it('clean all files according to appstack command', function(done){
      var paths = [profile.distPublic, profile.distViews],
          runner = async.compose( async.concat.partial(paths, glob, undefined) , clean);

      profile.moveDistFiles(function(){
        runner('build', function(err, files){
          files.should.have.length(2);
          done();
        });
      })
    });
  })
});