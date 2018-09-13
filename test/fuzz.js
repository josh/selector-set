(function() {
  "use strict";

  var testCount = 100;

  function seededRandomFn(seed) {
    function random() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }
    return random;
  }

  function retry(callback) {
    var n = 1000000;
    while (n--) {
      try {
        return callback();
      } catch (err) {
        continue;
      }
    }
  }

  var alpha = {};
  var c = 65535;
  while (--c) {
    var s = String.fromCharCode(c);
    // var m = s.match(/^[\w\u00c0-\uFFFF\-]$/);
    var m = s.match(/^[\wa-zA-Z0-9-]$/);
    if (m) {
      alpha[s] = c;
    }
  }
  alpha = Object.keys(alpha);

  function randomChar(rand) {
    return alpha[Math.floor(rand() * 1e10) % alpha.length];
  }

  function randomId(rand) {
    return randomChar(rand) + randomChar(rand) + randomChar(rand);
  }

  function randomElement(rand) {
    var el = retry(function() {
      return document.createElement(randomId(rand));
    });

    retry(function() {
      el.id = randomId(rand);
    });

    retry(function() {
      el.className = [randomId(rand), randomId(rand), randomId(rand)].join(" ");
    });

    retry(function() {
      el.setAttribute(randomId(rand), randomId(rand));
    });
    retry(function() {
      el.setAttribute(
        randomId(rand),
        [randomId(rand), randomId(rand)].join(" ")
      );
    });

    return el;
  }

  function randomTree(rand) {
    var child, parent, root;
    root = randomElement(rand);
    parent = root;

    var i = rand() * 100;
    while (--i > 0) {
      child = randomElement(rand);
      if (child) {
        parent.appendChild(child);
      }

      if (rand() > 0.75) {
        parent = child;
      }
    }
    return root;
  }

  function randomSelector(rand, el) {
    var sel;
    var len = el.attributes.length;

    if (len) {
      var i = Math.floor(rand() * 1000) % len;
      var attr = el.attributes[i];

      if (rand() > 0.25 && attr.name === "id") {
        sel = "#" + attr.value;
      } else if (rand() > 0.25 && attr.name === "class") {
        sel = "." + attr.value.split(" ")[0];
      } else {
        sel = "[" + attr.name + '="' + attr.value + '"]';
      }
    } else {
      sel = el.nodeName.toLowerCase();
    }

    try {
      if (SelectorSet.prototype.matchesSelector(document.body, sel + ",*")) {
        return sel;
      }
    } catch (err) {
      return;
    }
  }

  function randomSelectorsForRoot(rand, el) {
    var sels = [];

    var i,
      els = el.getElementsByTagName("*");
    for (i = 0; i < els.length; i++) {
      var sel = randomSelector(rand, els[i]);
      if (sel) {
        sels.push(sel);
      }
    }

    return sels;
  }

  if (!window.sessionStorage.seed) {
    window.sessionStorage.seed = Math.random();
  }
  var suiteSeed = parseFloat(window.sessionStorage.seed);
  var suiteRand = seededRandomFn(suiteSeed);

  function test(testName, callback) {
    var i, seed;

    function testFn(seed) {
      return function() {
        // eslint-disable-next-line no-invalid-this
        callback.call(this, seededRandomFn(seed));
      };
    }

    for (i = 0; i < testCount; i++) {
      seed = suiteRand();
      QUnit.test(testName + " (" + seed + ")", testFn(seed));
    }
  }

  function testEqual(actualObj, expectedObj) {
    function deepEqual(callback) {
      var actualValue, expectedValue, actualError, expectedError;

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

      if (actualError || expectedError) {
        QUnit.ok(actualError);
        QUnit.ok(expectedError);
      }
      QUnit.deepEqual(actualValue, expectedValue);
    }
    return deepEqual;
  }

  test("match", function(rand) {
    var expectedSet = new ExemplarSelectorSet();
    var actualSet = new SelectorSet();
    var deepEqual = testEqual(actualSet, expectedSet);

    var root = randomTree(rand);
    var els = root.getElementsByTagName("*");
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

  test("queryAll", function(rand) {
    var expectedSet = new ExemplarSelectorSet();
    var actualSet = new SelectorSet();
    var deepEqual = testEqual(actualSet, expectedSet);

    var root = randomTree(rand);
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

    deepEqual(function(set) {
      return set.queryAll(root);
    });
  });
})();
