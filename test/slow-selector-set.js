(function() {
  'use strict';

  function SelectorSet() {
    this.selectors = [];
  }

  SelectorSet.prototype.add = function(selector, data) {
    if (typeof selector === 'string') {
      this.selectors.push({selector: selector, data: data});
    }
  };

  SelectorSet.prototype.queryAll = function(root) {
    var i, obj, els, matches = [];
    for (i = 0; i < this.selectors.length; i++) {
      obj = this.selectors[i];
      els = SelectorSet.queryAll(obj.selector, root);
      if (els.length) {
        matches.push({selector: obj.selector, data: obj.data, elements: els});
      }
    }
    return matches;
  };

  SelectorSet.prototype.matches = function(el) {
    var i, obj, matches = [];
    for (i = 0; i < this.selectors.length; i++) {
      obj = this.selectors[i];
      if (el && SelectorSet.matches(el, obj.selector)) {
        matches.push({selector: obj.selector, data: obj.data});
      }
    }
    return matches;
  };

  SelectorSet.matches = window.SelectorSet.matches;
  SelectorSet.queryAll = window.SelectorSet.queryAll;
  window.SlowSelectorSet = SelectorSet;
})();
