/**
 * User: benpptung
 * Date: 2014/2/10
 * Time: PM4:56
 */

var mul = require('./lib/mul');

module.exports = function(a, b){
  return a + mul(b);
}