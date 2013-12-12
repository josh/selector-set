(function() {
  'use strict';

  function seededRandomFn(seed) {
    function random() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }
    return random;
  }

  function randomId(rand) {
    if (rand() > 0.5) {
      return rand().toString(36).replace(/[^a-z]+/g, '');
    } else if (rand() > 0.25) {
      return 'span';
    } else {
      return 'div';
    }
  }

  function randomTagName(rand) {
    if (rand() > 0.5) {
      return 'div';
    } else if (rand() > 0.25) {
      return 'span';
    } else {
      return 'p';
    }
  }

  function randomElement(rand) {
    var el = document.createElement(randomTagName(rand));

    if (rand() > 0.5) {
      el.id = randomId(rand);
    }

    if (rand() > 0.5) {
      el.className = [randomId(rand), randomId(rand), randomId(rand)].join(' ');
    }

    if (rand() > 0.5) {
      el.setAttribute('data-' + randomId(rand), randomId(rand));
    }
    if (rand() > 0.5) {
      el.setAttribute('data-' + randomId(rand), [randomId(rand), randomId(rand)].join(' '));
    }

    return el;
  }

  function randomTree(rand) {
    var child, parent, root;
    root = randomElement(rand);
    parent = root;

    var i = rand() * 100;
    while (--i > 0) {
      child = randomElement(rand);
      parent.appendChild(child);

      if (rand() > 0.75) {
        parent = child;
      }
    }
    return root;
  }

  function randomSelector(rand, el) {
    if (rand() < 0.25) {
      return;
    }

    var len = el.attributes.length;

    if (len) {
      var i = Math.floor(rand() * 1000) % len;
      var attr = el.attributes[i];

      if (attr.name === 'id') {
        return '#' + attr.value;
      } else if (attr.name === 'class') {
        return '.' + attr.value.split(' ')[0];
      } else {
        return '[' + attr.name + '="' + attr.value + '"]';
      }
    } else {
      return el.nodeName.toLowerCase();
    }
  }

  function randomSelectorsForRoot(rand, el) {
    var sels = [];

    var i, els = el.getElementsByTagName('*');
    for (i = 0; i < els.length; i++) {
      var sel = randomSelector(rand, els[i]);
      if (sel) {
        sels.push(sel);
      }
    }

    return sels;
  }


  if (!sessionStorage.seed) {
    sessionStorage.seed = Math.random();
  }
  var suiteSeed = parseFloat(sessionStorage.seed);
  var suiteRand = seededRandomFn(suiteSeed);
  var testCount = 500;

  function test(testName, callback) {
    var i, seed;

    function testFn(seed) {
      return function() {
        callback.call(this, seededRandomFn(seed));
      };
    }

    for (i = 0; i < testCount; i++) {
      seed = suiteRand();
      QUnit.test(testName + ' (' + seed + ')', testFn(seed));
    }
  }

  function testEqual(actualObj, expectedObj) {
    function deepEqual(callback) {
      var actualValue, expectedValue,
          actualError, expectedError;

      try {
        actualValue = callback(actualObj);
      } catch (err) {
        actualError = err;
      }

      try {
        expectedValue = callback(expectedObj);
      } catch (err) {
        expectedError = err;
      }

      if (actualError) {
        QUnit.ok(expectedError, 'expected error');
      } else {
        QUnit.deepEqual(actualValue, expectedValue);
      }
    }
    return deepEqual;
  }


  test('match', function(rand) {
    var expectedSet = new ExemplarSelectorSet();
    var actualSet = new SelectorSet();
    var deepEqual = testEqual(expectedSet, actualSet);

    var root = randomTree(rand);
    var els = root.getElementsByTagName('*');
    var sels = randomSelectorsForRoot(rand, root);

    deepEqual(function(set) {
      return set.size;
    });

    function setAdd(set) {
      return set.add(sels[i]);
    }
    var i;
    for (i = 0; i < sels.length; i++) {
      deepEqual(setAdd);
    }

    deepEqual(function(set) {
      return set.size;
    });

    function setMatch(set) {
      return set.matches(els[i]);
    }
    for (i = 0; i < els.length; i++) {
      deepEqual(setMatch);
    }
  });
})();
