(function() {
  'use strict';

  function seededRandomFn(seed) {
    function random() {
      seed++;
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }
    return random;
  }


  if (!sessionStorage.seed) {
    sessionStorage.seed = Math.random();
  }
  var suiteSeed = parseFloat(sessionStorage.seed);
  var suiteRand = seededRandomFn(suiteSeed);
  var testCount = 10;

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


  test('add', function(rand) {
    ok(true, rand());
    ok(true, rand());
    ok(true, rand());
  });
})();
