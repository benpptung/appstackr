'use strict';

var colors = require('colors');

var props = {
  checked: true,
  other1: 1,
  other2: 2,
  other3: 3
};

var { checked, ...other } = props;

console.log(checked);
console.log(other);