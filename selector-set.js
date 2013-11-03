(function() {
  'use strict';

  function SelectorSet() {
    if (!(this instanceof SelectorSet)) {
      return new SelectorSet();
    }

    this.uid = 0;
    this.querySelectors = [];
    this.matchSelectors = {
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

  // Public: Check if element matches selector.
  //
  // Maybe overridden with custom Element.matches function.
  //
  // el       - An Element
  // selector - String CSS selector
  //
  // Returns true or false.
  SelectorSet.matches = function(el, selector) {
    return matches.call(el, selector);
  };

  // Public: Find all elements in the context that match the selector.
  //
  // Maybe overridden with custom querySelectorAll function.
  //
  // selectors - String CSS selectors.
  // context   - Element context
  //
  // Returns non-live list of Elements.
  SelectorSet.queryAll = function(selectors, context) {
    return context.querySelectorAll(selectors);
  };

  // Public: Add selector to set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.add = function(selector, data) {
    var obj, i, len, groups, g, values,
        matchSelectors = this.matchSelectors,
        querySelectors = this.querySelectors;

    if (typeof selector !== 'string') {
      return;
    }

    obj = {
      id: this.uid++,
      selector: selector,
      data: data
    };

    groups = getSelectorGroups(selector);
    for (i = 0, len = groups.length; i < len; i++) {
      g = groups[i];
      if (g.key) {
        values = matchSelectors[g.type][g.key];
        if (!values) {
          matchSelectors[g.type][g.key] = values = [];
        }
      } else {
        values = matchSelectors[g.type];
        if (!values) {
          matchSelectors[g.type] = values = [];
        }
      }
      values.push(obj);
    }

    querySelectors.push(selector);
  };

  // Public: Find all matching decendants of the context element.
  //
  // context - An Element
  //
  // Returns Array of {selector, data, elements} matches.
  SelectorSet.prototype.queryAll = function(context) {
    var matches = {};

    var els = SelectorSet.queryAll(this.querySelectors.join(', '), context);

    var i, j, len, len2, el, m, obj;
    for (i = 0, len = els.length; i < len; i++) {
      el = els[i];
      m = this.matches(el);
      for (j = 0, len2 = m.length; j < len2; j++) {
        obj = m[j];
        if (!matches[obj.id]) {
          matches[obj.id] = {
            id: obj.id,
            selector: obj.selector,
            data: obj.data,
            elements: []
          };
        }
        matches[obj.id].elements.push(el);
      }
    }

    var results = [];
    for (m in matches) {
      results.push(matches[m]);
    }

    return results;
  };

  // Public: Match element against all selectors in set.
  //
  // el - An Element
  //
  // Returns Array of {selector, data} matches.
  SelectorSet.prototype.matches = function(el) {
    if (!el) {
      return [];
    }

    var selectors = this.matchSelectors;
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

  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
  var idRe = /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  var classRe = /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;

  // Find best selector groups for CSS selectors.
  //
  // selectors - CSS selector String.
  //
  // Returns an Array of {type, key} objects.
  function getSelectorGroups(selectors) {
    var m, n, last, rest = selectors, groups = [];

    do {
      chunker.exec('');
      if (m = chunker.exec(rest)) {
        rest = m[3];
        if (m[2] || !rest) {
          last = m[1];
          if (n = last.match(idRe)) {
            groups.push({ type: 'ID', key: n[0].slice(1) });
          } else if (n = last.match(classRe)) {
            groups.push({ type: 'CLASS', key: n[0].slice(1) });
          } else if (n = last.match(tagRe)) {
            groups.push({ type: 'TAG', key: n[0].toUpperCase() });
          } else {
            groups.push({ type: 'UNIVERSAL' });
          }
        }
      }
    } while (m);

    return groups;
  }


  window.SelectorSet = SelectorSet;
})();
