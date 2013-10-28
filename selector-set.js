(function() {
  "use strict";

  function SelectorSet() {
    this.uid = 0;
    this.selectors = [];
  }

  SelectorSet.matches = function(el, selector) {
    return el.webkitMatchesSelector(selector);
  };

  SelectorSet.querySelectorAll = function(el, selector) {
    return el.querySelectorAll(selector);
  };

  SelectorSet.prototype.add = function(selector, data) {
    if (typeof selector === "string") {
      this.selectors.push({
        id: this.uid++,
        selector: selector,
        data: data
      });
    }
  };

  SelectorSet.prototype.querySelectorAll = function(el) {
    var matches = [];

    for (var i = 0; i < this.selectors.length; i++) {
      var obj = this.selectors[i];
      var elements = SelectorSet.querySelectorAll(el, obj.selector);

      if (elements.length > 0) {
        matches.push({
          id: obj.id,
          selector: obj.selector,
          data: obj.data,
          elements: elements
        });
      }
    }

    return matches;
  };

  SelectorSet.prototype.matches = function(el) {
    var matches = [];

    if (!el) {
      return matches;
    }

    for (var i = 0; i < this.selectors.length; i++) {
      var obj = this.selectors[i];

      if (SelectorSet.matches(el, obj.selector)) {
        matches.push({
          id: obj.id,
          selector: obj.selector,
          data: obj.data
        });
      }
    }

    return matches;
  };

  window.SelectorSet = SelectorSet;
})();
