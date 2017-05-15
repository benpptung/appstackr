'use strict';

var o = {};
var _b = 'b';

Object.defineProperties(o, {

  s: {
    get: _=> 'ssss'
  },

  b: {
    get: _=> _b,
    set: val=> _b = 'bbb'
  }

});

console.log(o.s);
console.log(o.b);

o.b = 5;
console.log(o.b);