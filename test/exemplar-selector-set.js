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
      els = this.querySelectorAll(obj.selector, context);
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
      if (el && this.matchesSelector(el, obj.selector)) {
        matches.push({selector: obj.selector, data: obj.data});
      }
    }
    return matches;
  };

  ExemplarSelectorSet.prototype.matchesSelector = window.SelectorSet.prototype.matchesSelector;
  ExemplarSelectorSet.prototype.querySelectorAll = window.SelectorSet.prototype.querySelectorAll;

  window.ExemplarSelectorSet = ExemplarSelectorSet;
})();
