(function() {
  'use strict';

  function SelectorSet() {
    this.uid = 0;
    this.selectors = [];
    this._selectors = {
      'ID': {},
      'CLASS': {},
      'TAG': {},
      'UNIVERSAL': []
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

    if (typeof selector === 'string') {
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
    if (!el) {
      return [];
    }

    var selectors = this._selectors;
    var i, j, len, len2;

    var selectorGroup, possibleMatches = [];

    if (selectorGroup = selectors.ID[el.id]) {
      for (i = 0, len = selectorGroup.length; i < len; i++) {
        possibleMatches.push(selectorGroup[i]);
      }
    }

    var className = el.className;
    if (className) {
      var classSelectors = selectors.CLASS;
      var classNames = className.split(/\s/);
      for (j = 0, len2 = classNames.length; j < len2; j++) {
        if (selectorGroup = classSelectors[classNames[j]]) {
          for (i = 0, len = selectorGroup.length; i < len; i++) {
            possibleMatches.push(selectorGroup[i]);
          }
        }
      }
    }

    if (selectorGroup = selectors.TAG[el.nodeName]) {
      for (i = 0, len = selectorGroup.length; i < len; i++) {
        possibleMatches.push(selectorGroup[i]);
      }
    }

    if (selectorGroup = selectors.UNIVERSAL) {
      for (i = 0, len = selectorGroup.length; i < len; i++) {
        possibleMatches.push(selectorGroup[i]);
      }
    }

    var obj, ids = {}, matches = [];
    for (i = 0, len = possibleMatches.length; i < len; i++) {
      obj = possibleMatches[i];
      if (!ids[obj.id] && SelectorSet.matches(el, obj.selector)) {
        ids[obj.id] = true;
        matches.push({
          id: obj.id,
          selector: obj.selector,
          data: obj.data
        });
      }
    }

    matches.sort(function(a, b) {
      return a.id - b.id;
    });

    return matches;
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


  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
  var idRe = /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  var classRe = /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;

  // Parse CSS selector into parts.
  //
  // Adopted from Sizzle.
  //
  // selectors - CSS selector String.
  //
  // Returns an Array of Strings.
  function parseSelector(selectors) {
    var m, rest = selectors, parts = [];

    do {
      chunker.exec('');
      if (m = chunker.exec(rest)) {
        rest = m[3];
        if (m[2] || !rest) {
          parts.push(m[1]);
        }
      }
    } while (m);

    return parts;
  }

  // Find best selector groups for CSS selectors.
  //
  // selectors - CSS selector String.
  //
  // Returns an Array of {type, key} objects.
  function getSelectorGroups(selectors) {
    var selector, result, i, m;

    result = [];
    selectors = parseSelector(selectors);

    for (i = 0; i < selectors.length; i++) {
      selector = selectors[i];

      if (selector) {
        if (m = selector.match(idRe)) {
          result.push({ type: 'ID', key: m[0].slice(1) });
        } else if (m = selector.match(classRe)) {
          result.push({ type: 'CLASS', key: m[0].slice(1) });
        } else if (m = selector.match(tagRe)) {
          result.push({ type: 'TAG', key: m[0].toUpperCase() });
        } else {
          result.push({ type: 'UNIVERSAL' });
        }
      }
    }

    return result;
  }


  window.SelectorSet = SelectorSet;
})();
