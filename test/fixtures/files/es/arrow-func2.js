'use strict';

var prototype = People.prototype;

function People(opt) {

  var secret = opt.secret;

  Object.defineProperties(this, {
    secret: { get: _=> secret}
  });


  this.prepare(s=> secret = s);

  this.listen = this.listener();
}

prototype.prepare = function(set_secret) {

  set_secret('secret prepared');
};

prototype.listener = function() {
  return done=> {
    done(null, this.secret);
  }
};

var me = new People({});

console.log(me.secret);

me.listen(function(err, s) {
  if (err) return console.error(err);
  console.log('from listen:' + s);
});

