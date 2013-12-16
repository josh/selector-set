(function(window) {
  'use strict';

  // Public: Create a new SelectorSet.
  function SelectorSet() {
    // Construct new SelectorSet if called as a function.
    if (!(this instanceof SelectorSet)) {
      return new SelectorSet();
    }

    // Public: Number of selectors added to the set
    this.size = 0;

    // Internal: Incrementing ID counter
    this.uid = 0;

    // Internal: Array of String selectors in the set
    this.selectors = [];

    // Internal: All Object index String names mapping to Index objects.
    this.indexes = Object.create(this.indexes);

    // Internal: Used Object index String names mapping to Index objects.
    this.activeIndexes = {};
  }

  // Detect prefixed Element#matches function.
  var docElem = window.document.documentElement;
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
  SelectorSet.prototype.matchesSelector = function(el, selector) {
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
  SelectorSet.prototype.querySelectorAll = function(selectors, context) {
    return context.querySelectorAll(selectors);
  };


  // Public: Array of indexes.
  //
  // name     - Unique String name
  // selector - Function that takes a String selector and returns a String key
  //            or undefined if it can't be used by the index.
  // element  - Function that takes an Element and returns an Array of String
  //            keys that point to indexed values.
  //
  SelectorSet.prototype.indexes = [];

  // Index by element id
  var idRe = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
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

  // Index by all of its class names
  var classRe = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'CLASS',
    selector: function matchClassSelector(sel) {
      var m;
      if (m = sel.match(classRe)) {
        return m[0].slice(1);
      }
    },
    element: function getElementClassNames(el) {
      var className = el.className;
      if (className) {
        if (typeof className === 'string') {
          return className.split(/\s/);
        } else if (className instanceof SVGAnimatedString) {
          return className.baseVal.split(/\s/);
        }
      }
    }
  });

  // Index by tag/node name: `DIV`, `FORM`, `A`
  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'TAG',
    selector: function matchTagSelector(sel) {
      var m;
      if (m = sel.match(tagRe)) {
        return m[0].toUpperCase();
      }
    },
    element: function getElementTagName(el) {
      return [el.nodeName.toUpperCase()];
    }
  });

  // Default index just contains a single array of elements.
  SelectorSet.prototype.indexes['default'] = {
    name: 'UNIVERSAL',
    selector: function() {
      return true;
    },
    element: function() {
      return [true];
    }
  };


  // Use ES Maps when supported
  var Map;
  if (typeof window.Map === 'function') {
    Map = window.Map;
  } else {
    Map = (function() {
      function Map() {
        this.map = {};
      }
      Map.prototype.get = function(key) {
        return this.map[key + ' '];
      };
      Map.prototype.set = function(key, value) {
        this.map[key + ' '] = value;
      };
      return Map;
    })();
  }


  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;

  // Internal: Get indexes for selector.
  //
  // selector - String CSS selector
  //
  // Returns Array of {index, key}.
  SelectorSet.prototype.selectorIndexes = function(selector) {
    var allIndexes = this.indexes.slice(0).concat(this.indexes['default']),
        allIndexesLen = allIndexes.length,
        i, m, rest = selector,
        key, index, indexes = [];

    do {
      chunker.exec('');
      if (m = chunker.exec(rest)) {
        rest = m[3];
        if (m[2] || !rest) {
          for (i = 0; i < allIndexesLen; i++) {
            index = allIndexes[i];
            if (key = index.selector(m[1])) {
              indexes.push({index: index, key: key});
              break;
            }
          }
        }
      }
    } while (m);

    return indexes;
  };

  // Public: Log when added selector falls under the default index.
  //
  // This API should not be considered stable. May change between
  // minor versions.
  //
  // obj - {selector, data} Object
  //
  //   SelectorSet.prototype.logDefaultIndexUsed = function(obj) {
  //     console.warn(obj.selector, "could not be indexed");
  //   };
  //
  // Returns nothing.
  SelectorSet.prototype.logDefaultIndexUsed = function() {};

  // Public: Add selector to set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.add = function(selector, data) {
    var obj, i, index, key, selIndex, objs,
        selectorIndexes, selectorIndex,
        indexes = this.activeIndexes,
        selectors = this.selectors;

    if (typeof selector !== 'string') {
      return;
    }

    obj = {
      id: this.uid++,
      selector: selector,
      data: data
    };

    selectorIndexes = this.selectorIndexes(selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      key = selectorIndex.key;
      index = selectorIndex.index;
      selIndex = indexes[index.name];
      if (!selIndex) {
        selIndex = indexes[index.name] = Object.create(index);
        selIndex.keys = new Map();
      }
      if (index === this.indexes['default']) {
        this.logDefaultIndexUsed(obj);
      }
      objs = selIndex.keys.get(key);
      if (!objs) {
        objs = [];
        selIndex.keys.set(key, objs);
      }
      objs.push(obj);
    }

    this.size++;
    selectors.push(selector);
  };

  // Public: Remove selector from set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.remove = function(selector, data) {
    if (typeof selector !== 'string') {
      return;
    }

    var selectorIndexes, selectorIndex, i, j, key, index, selIndex, objs, obj;
    var indexes = this.activeIndexes;
    var removedIds = {};
    var removeAll = arguments.length === 1;

    selectorIndexes = this.selectorIndexes(selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      key = selectorIndex.key;
      index = selectorIndex.index;
      selIndex = indexes[index.name];

      if (selIndex) {
        objs = selIndex.keys.get(key);
        if (objs) {
          j = objs.length;
          while (j--) {
            obj = objs[j];
            if (obj.selector === selector && (removeAll || obj.data === data)) {
              objs.splice(j, 1);
              removedIds[obj.id] = true;
            }
          }
        }
      }
    }

    this.size -= Object.keys(removedIds).length;
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
    if (!this.selectors.length) {
      return [];
    }

    var matches = {};

    var els = this.querySelectorAll(this.selectors.join(', '), context);

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
    var indexes = this.activeIndexes, matchedIds = {}, matches = [];

    for (indexName in indexes) {
      index = indexes[indexName];
      keys = index.element(el);
      if (keys) {
        for (i = 0, len = keys.length; i < len; i++) {
          if (objs = index.keys.get(keys[i])) {
            for (j = 0, len2 = objs.length; j < len2; j++) {
              obj = objs[j];
              id = obj.id;
              if (!matchedIds[id] && this.matchesSelector(el, obj.selector)) {
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

  // Public: Expose SelectorSet as a global on window.
  window.SelectorSet = SelectorSet;
})(window);
