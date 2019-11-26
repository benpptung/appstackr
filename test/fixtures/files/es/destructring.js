'use strict';

var fn = module.exports = function() {
  let [a, ,b] = [1, 2, 3]
  return [a, b]
}

var ar = ['a'].concat(fn())

console.log(ar)
