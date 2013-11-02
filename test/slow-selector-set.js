(function() {
  'use strict';

  function SelectorSet() {
    this.selectors = [];
  }

  SelectorSet.prototype.add = function(selector, data) {
    if (typeof selector === 'string') {
      this.selectors.push({
        selector: selector,
        data: data
      });
    }
  };

  SelectorSet.prototype.queryAll = function(el) {
    var matches = [];
    this.selectors.forEach(function(obj) {
      var elements = SelectorSet.queryAll(obj.selector, el);
      if (elements.length > 0) {
        matches.push({
          selector: obj.selector,
          data: obj.data,
          elements: elements
        });
      }
    });
    return matches;
  };

  SelectorSet.prototype.matches = function(el) {
    var matches = [];
    this.selectors.forEach(function(obj) {
      if (el && SelectorSet.matches(el, obj.selector)) {
        matches.push({
          selector: obj.selector,
          data: obj.data
        });
      }
    });
    return matches;
  };

  SelectorSet.matches = window.SelectorSet.matches;
  SelectorSet.queryAll = window.SelectorSet.queryAll;
  window.SlowSelectorSet = SelectorSet;
})();
