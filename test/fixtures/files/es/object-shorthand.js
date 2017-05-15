'use strict';

var list = [1, 2, 3];
var name = 'ben';
var newlist = function() {
  return this.list.map(n=> Math.pow(n, 2));
};

var o = {list, name, newlist};

console.log(o.list);
console.log(`hi! ${o.name}`);
console.log(o.newlist());