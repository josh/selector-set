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
    var selector, tokens, lastToken, result, m;

    result = [];
    selectors = selectors.split(/\s*,\s*/);

    for (var i = 0; i < selectors.length; i++) {
      selector = selectors[i];
      tokens = parse(selector);
      lastToken = tokens[tokens.length-1];

      if (lastToken) {
        if (m = lastToken.match(match.ID)) {
          result.push({ type: "ID", key: m[0].slice(1) });
        } else if (m = lastToken.match(match.CLASS)) {
          result.push({ type: "CLASS", key: m[0].slice(1) });
        } else if (m = lastToken.match(match.TAG)) {
          result.push({ type: "TAG", key: m[0].toUpperCase() });
        } else {
          result.push({ type: "UNIVERSAL" });
        }
      }
    }

    return result;
  }

  function SelectorSet() {
    this.uid = 0;
    this.selectors = [];
    this._selectors = {
      "ID": {},
      "CLASS": {},
      "TAG": {},
      "UNIVERSAL": []
    };
  }


  var docElem = document.documentElement;
  var matches = (docElem.webkitMatchesSelector ||
                  docElem.mozMatchesSelector ||
                  docElem.oMatchesSelector ||
                  docElem.msMatchesSelector);

  SelectorSet.matches = function(el, selector) {
    return matches.call(el, selector);
  };

  SelectorSet.querySelectorAll = function(el, selector) {
    return el.querySelectorAll(selector);
  };

  SelectorSet.prototype.add = function(selector, data) {
    var self = this;

    if (typeof selector === "string") {
      var obj = {
        id: this.uid++,
        selector: selector,
        data: data
      };

      getSelectorGroups(selector).forEach(function(g) {
        var values;
        if (g.key) {
          values = self._selectors[g.type][g.key];
          if (!values) {
            values = [];
            self._selectors[g.type][g.key] = values;
          }
        } else {
          values = self._selectors[g.type];
          if (!values) {
            values = [];
            self._selectors[g.type] = values;
          }

        }
        values.push(obj);
      });

      this.selectors.push(obj);
    }
  };

  SelectorSet.prototype.querySelectorAll = function(el) {
    var matches = [];
    this.selectors.forEach(function(obj) {
      var elements = SelectorSet.querySelectorAll(el, obj.selector);
      if (elements.length > 0) {
        matches.push({
          id: obj.id,
          selector: obj.selector,
          data: obj.data,
          elements: elements
        });
      }
    });
    return matches;
  };

  SelectorSet.prototype.matches = function(el) {
    var selectors, matches = {};

    if (!el) {
      return [];
    }

    function matchSelectors(obj) {
      if (el && SelectorSet.matches(el, obj.selector)) {
        matches[obj.id] = {
          id: obj.id,
          selector: obj.selector,
          data: obj.data
        };
      }
    }

    selectors = this._selectors["ID"][el.id];
    if (selectors) {
      selectors.forEach(matchSelectors);
    }

    var classNames = el.className.split(" ");
    for (var j = 0; j < classNames.length; j++) {
      selectors = this._selectors["CLASS"][classNames[j]];
      if (selectors) {
        selectors.forEach(matchSelectors);
      }
    }

    selectors = this._selectors["TAG"][el.nodeName];
    if (selectors) {
      selectors.forEach(matchSelectors);
    }

    selectors = this._selectors["UNIVERSAL"];
    if (selectors) {
      selectors.forEach(matchSelectors);
    }

    var ary = [];
    for (var id in matches) {
      ary.push(matches[id]);
    }

    ary.sort(function(a, b) {
      return a.id - b.id;
    });

    return ary;
  };

  // SelectorSet.prototype.matches = function(el) {
  //   var matches = [];
  //   this.selectors.forEach(function(obj) {
  //     if (el && SelectorSet.matches(el, obj.selector)) {
  //       matches.push({
  //         id: obj.id,
  //         selector: obj.selector,
  //         data: obj.data
  //       });
  //     }
  //   });
  //   return matches;
  // };

  window.SelectorSet = SelectorSet;
})();
