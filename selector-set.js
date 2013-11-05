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

  SelectorSet.indexes.push({
    name: 'UNIVERSAL',
    selector: function() {
      return '*';
    },
    element: function() {
      return ['*'];
    }
  });


  // Public: Add selector to set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.add = function(selector, data) {
    var obj, i, len, selIndexes, sel, indexName,
        indexes = this.indexes,
        selectors = this.selectors;

    if (typeof selector !== 'string') {
      return;
    }

    obj = {
      id: this.size++,
      selector: selector,
      data: data
    };

    selIndexes = getSelectorIndexes(selector);
    for (i = 0, len = selIndexes.length; i < len; i++) {
      sel = selIndexes[i];
      indexName = sel.index.name;
      if (!indexes[indexName]) {
        indexes[indexName] = { index: sel.index, keys: {} };
      }
      if (!indexes[indexName].keys[sel.key]) {
        indexes[indexName].keys[sel.key] = [];
      }
      indexes[indexName].keys[sel.key].push(obj);
    }

    selectors.push(selector);
  };

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

    var i, j, len, len2, keys, objs, obj, index, indexName;
    var indexes = this.indexes, ids = {}, matches = [];

    for (indexName in indexes) {
      index = indexes[indexName];
      keys = index.index.element(el) || [];
      for (i = 0, len = keys.length; i < len; i++) {
        if (objs = index.keys[keys[i]]) {
          for (j = 0, len2 = objs.length; j < len2; j++) {
            obj = objs[j];
            if (!ids[obj.id] && SelectorSet.matches(el, obj.selector)) {
              ids[obj.id] = true;
              matches.push(obj);
            }
          }
        }
      }
    }

    return matches.sort(sortById);
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

  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;

  // Find best selector indexes for CSS selectors.
  //
  // selectors - CSS selector String.
  //
  // Returns an Array of {index, key} objects.
  function getSelectorIndexes(selectors) {
    var m, i, len, index, key;
    var indexes = SelectorSet.indexes;
    var rest = selectors, selIndexes = [];

    do {
      chunker.exec('');
      if (m = chunker.exec(rest)) {
        rest = m[3];
        if (m[2] || !rest) {
          for (i = 0, len = indexes.length; i < len; i++) {
            index = indexes[i];
            if (key = index.selector(m[1])) {
              selIndexes.push({index: index, key: key});
              break;
            }
          }
        }
      }
    } while (m);

    return selIndexes;
  }


  window.SelectorSet = SelectorSet;
})();
