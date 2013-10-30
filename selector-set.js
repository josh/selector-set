(function() {
  "use strict";

  // From Sizzle
  //   https://github.com/jquery/sizzle/blob/master/sizzle.js
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
  var match = {
    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    TAG: /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/g,
    PSEUDO_CLASS: /[^:]:(?!first-line|first-letter|before|after)((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/g,
    PSEUDO_ELEMENT: /(:first-line|:first-letter|:before|:after)|::((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/g
  };

  // Parse CSS selector into parts.
  //
  // Adopted from Sizzle.
  //
  // selector - CSS selector String.
  //
  // Returns an Array of Strings.
  function parse(selector) {
    var m, rest = selector, parts = [];

    do {
      chunker.exec("");
      if (m = chunker.exec(rest)) {
        rest = m[3];
        parts.push(m[1]);
        if (m[2]) {
          break;
        }
      }
    } while (m);

    return parts;
  }

  function getSelectorGroups(selectors) {
    var selector, tokens, result, m;

    result = [];
    selectors = selectors.split(/\s*,\s*/);

    for (var i = 0; i < selectors.length; i++) {
      selector = selectors[0];
      tokens = parse(selector);

      if (tokens[0]) {
        if (m = tokens[0].match(match.ID)) {
          result.push({ type: "ID", key: m[0].slice(1) });
        } else if (m = tokens[0].match(match.CLASS)) {
          result.push({ type: "CLASS", key: m[0].slice(1) });
        } else if (m = tokens[0].match(match.TAG)) {
          result.push({ type: "TAG", key: m[0].toUpperCase() });
        }
      }
    }

    return result;
  }

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
      getSelectorGroups(selector);

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
