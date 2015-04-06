'use strict';

var Ractive = require('Ractive');

Ractive({
  el: '#alice-box',
  template: attach('./ui.ract'),
  data: {
    name: 'Ben',
    unread: 6,
