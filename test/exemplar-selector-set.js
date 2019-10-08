(function() {
  'use strict';

  function ExemplarSelectorSet() {
    this.selectors = [];
    this.uid = 0;
  }

  ExemplarSelectorSet.prototype = Object.create(SelectorSet.prototype, {
    constructor: {
      enumerable: false,
      value: ExemplarSelectorSet
    },
    size: {
      get: function() {
        return this.selectors.length;
      }
    }
  });

  ExemplarSelectorSet.prototype.add = function(selector, data) {
    if (typeof selector === 'string') {
      this.selectors.push({
        id: this.uid++,
        selector: selector,
        data: data
      });
    }
  };

  ExemplarSelectorSet.prototype.remove = function(selector, data) {
    if (typeof selector === 'string') {
      var obj,
        selectors = [],
        i = this.selectors.length;
      while (i--) {
        obj = this.selectors[i];
        if (
          obj.selector !== selector ||
          (arguments.length === 2 && obj.data !== data)
        ) {
          selectors.push(obj);
        }
      }
      this.selectors = selectors;
    }
  };

  ExemplarSelectorSet.prototype.queryAll = function(context) {
    var i,
      obj,
      els,
      matches = [];
    for (i = 0; i < this.selectors.length; i++) {
      obj = this.selectors[i];
      els = this.querySelectorAll(obj.selector, context);
      if (els.length) {
        matches.push({
          id: obj.id,
          selector: obj.selector,
          data: obj.data,
          elements: Array.prototype.slice.call(els, 0)
        });
      }
    }
    return matches;
  };

  ExemplarSelectorSet.prototype.matches = function(el) {
    var i,
      obj,
      matches = [];
    for (i = 0; i < this.selectors.length; i++) {
      obj = this.selectors[i];
      if (el && this.matchesSelector(el, obj.selector)) {
        matches.push({
          id: obj.id,
          selector: obj.selector,
          data: obj.data
        });
      }
    }
    return matches;
  };

  window.ExemplarSelectorSet = ExemplarSelectorSet;
})();
