/**
 * Copyright (c) 2014
 * Licensed under the MIT license.
 * Date: 2014/2/24
 * Time: PM5:26
 */

// global functions
if (typeof Function.prototype.partial != "function") {
  Function.prototype.partial = function () {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function () {
      var idx = 0, new_args = [];
      for (var i = 0, len = args.length; i < len; i++) {

        new_args[i] = args[i] === undefined ? arguments[idx++] : args[i];
      }
      return fn.apply(this, new_args);
    }
  };
}

// import jQuery
var $ = (window && window.jQuery);

exports.$ = $;

// binding jQuery methods
exports.extend = $.extend;

var tmpl = function (str, data) {

  var fn =   new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
          "with(obj){p.push('" +

        // Convert the template into pure JavaScript
          str
              .replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");

  return data ? fn(data) : fn;
};

/**
 * Only take the first element in the jQuery set, act like .html()
 * If data visible, return string, or return function for templating resue purpose
 *
 * function is cached on the element which provide template
 *
 * @param [data]
 * @returns {String|Function}
 */

$.fn.tmpl = function(data){
  var $this = this.first(), // this plugin only works for first element
      fn = $this.data('tmpl');
  if (!fn) $this.data('tmpl', ( fn = tmpl($this.html())) );
  return data ? fn(data) : fn;
};

/**
 *  this method is acting also like .each $.each @ jQuery
 *  Also bind this fundtion on jQuery, if we need to translate the template loaded from server
 */
$.tmpl = tmpl;

// traits
exports.traits = {
  on: function () {
    var $this = $(this);
    $this.on.apply($this, arguments);
  },
  off: function () {
    var $this = $(this);
    $this.off.apply($this, arguments);
  },
  trigger: function () {
    var $this = $(this);
    $this.trigger.apply($this, arguments);
  },
  triggerHandler: function () {
    var $this = $(this);
    $this.triggerHandler.apply($this, arguments);
  }
};

/**
 * @returns {String}
 */
exports.uuid = function () {
  var i, random;
  var uuid = '';

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
  }

  return uuid;
};

/**
 *
 * @param {Number} count
 * @param {String} word
 * @returns {String}
 */
exports.pluralize = function (count, word) {
  return count === 1 ? word : word + 's';
};

/**
 *
 * @param {String} namespace
 * @param {Object} data
 * @returns {*}
 */
exports.store = function (namespace, data) {
  if (arguments.length > 1) {
    return localStorage.setItem(namespace, JSON.stringify(data));
  } else {
    var store = localStorage.getItem(namespace);
    return (store && JSON.parse(store)) || [];
  }
};

