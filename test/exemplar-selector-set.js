(function() {
  'use strict';

  function ExemplarSelectorSet() {
    this.selectors = [];
  }

  ExemplarSelectorSet.prototype.add = function(selector, data) {
    if (typeof selector === 'string') {
      this.selectors.push({selector: selector, data: data});
    }
  };

  ExemplarSelectorSet.prototype.queryAll = function(context) {
    var i, obj, els, matches = [];
    for (i = 0; i < this.selectors.length; i++) {
      obj = this.selectors[i];
      els = this.constructor.queryAll(obj.selector, context);
      if (els.length) {
        matches.push({selector: obj.selector, data: obj.data, elements: els});
      }
    }
    return matches;
  };

  ExemplarSelectorSet.prototype.matches = function(el) {
    var i, obj, matches = [];
    for (i = 0; i < this.selectors.length; i++) {
      obj = this.selectors[i];
      if (el && this.constructor.matches(el, obj.selector)) {
        matches.push({selector: obj.selector, data: obj.data});
      }
    }
    return matches;
  };

  ExemplarSelectorSet.matches = window.SelectorSet.matches;
  ExemplarSelectorSet.queryAll = window.SelectorSet.queryAll;

  window.ExemplarSelectorSet = ExemplarSelectorSet;
})();
