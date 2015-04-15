'use strict';

var Ractive = require('ractive');

Ractive.extend({
  el: '#alice-box',
  template: require('./ui.ract'),
  data: {
    name: 'Ben',
    unread: 6,
    total: 10
  },
  computed: {
    percent_text: function() {
      return Math.round((this.get('unread') / this.get('total')) * 1000 ) / 10;
    },
    percent_float: function() {
      return (this.get('unread') / this.get('total')) * 100;
    }
  },
  css: require('./ui.scss')

})();
