(function() {
  'use strict';

  function SelectorSet() {
    if (!(this instanceof SelectorSet)) {
      return new SelectorSet();
    }

    this.size = 0;
    this.selectors = [];
    this.indexes = {};
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


  SelectorSet.indexes = [];

  var idRe = /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.indexes.push({
    name: 'ID',
    selector: function matchIdSelector(sel) {
      var m;
      if (m = sel.match(idRe)) {
        return m[0].slice(1);
      }
    },
    element: function getElementId(el) {
      if (el.id) {
        return [el.id];
      }
    }
  });

  var classRe = /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.indexes.push({
    name: 'CLASS',
    selector: function matchClassSelector(sel) {
      var m;
      if (m = sel.match(classRe)) {
        return m[0].slice(1);
      }
    },
    element: function getElementClassNames(el) {
      if (el.className) {
        return el.className.split(/\s/);
      }
    }
  });

  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.indexes.push({
    name: 'TAG',
    selector: function matchTagSelector(sel) {
      var m;
      if (m = sel.match(tagRe)) {
        return m[0].toUpperCase();
      }
    },
    element: function getElementTagName(el) {
      return [el.nodeName];
    }
  });

  SelectorSet.indexes.default = {
    name: 'UNIVERSAL',
    selector: function() {
      return true;
    },
    element: function() {
      return [true];
    }
  };


  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;

  // Public: Add selector to set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.add = function(selector, data) {
    var obj, i, m, index, key, indexName, selIndex, objs,
        indexes = this.indexes,
        selectors = this.selectors,
        rest = selector;

    if (typeof selector !== 'string') {
      return;
    }

    obj = {
      id: this.size++,
      selector: selector,
      data: data
    };

    var allIndexes = SelectorSet.indexes.concat(SelectorSet.indexes.default),
     allIndexesLen = allIndexes.length;

    do {
      chunker.exec('');
      if (m = chunker.exec(rest)) {
        rest = m[3];
        if (m[2] || !rest) {
          for (i = 0; i < allIndexesLen; i++) {
            index = allIndexes[i];
            if (key = index.selector(m[1])) {
              indexName = index.name;
              selIndex = indexes[indexName];
              if (!selIndex) {
                selIndex = indexes[indexName] = Object.create(index);
                selIndex.keys = {};
              }
              objs = selIndex.keys[key];
              if (!objs) {
                objs = selIndex.keys[key] = [];
              }
              objs.push(obj);
              break;
            }
          }
        }
      }
    } while (m);

    selectors.push(selector);
  };

  // Sort by id property handler.
  //
  // a - Selector obj.
  // b - Selector obj.
  //
  // Returns Number.
  function sortById(a, b) {
    return a.id - b.id;
  }

  // Public: Find all matching decendants of the context element.
  //
  // context - An Element
  //
  // Returns Array of {selector, data, elements} matches.
  SelectorSet.prototype.queryAll = function(context) {
    var matches = {};

    var els = SelectorSet.queryAll(this.selectors.join(', '), context);

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

    return results.sort(sortById);
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

    var i, j, len, len2, indexName, index, keys, objs, obj, id;
    var indexes = this.indexes, matchedIds = {}, matches = [];

    for (indexName in indexes) {
      index = indexes[indexName];
      keys = index.element(el);
      if (keys) {
        for (i = 0, len = keys.length; i < len; i++) {
          if (objs = index.keys[keys[i]]) {
            for (j = 0, len2 = objs.length; j < len2; j++) {
              obj = objs[j];
              id = obj.id;
              if (!matchedIds[id] && SelectorSet.matches(el, obj.selector)) {
                matchedIds[id] = true;
                matches.push(obj);
              }
            }
          }
        }
      }
    }

    return matches.sort(sortById);
  };


  window.SelectorSet = SelectorSet;
})();
