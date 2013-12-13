(function() {
  'use strict';

  module('queryAll');

  test('undefined', function() {
    var set = new SelectorSet();
    var results = set.queryAll(null);
    equal(results.length, 0);
  });

  test('no selectors', function() {
    var set = new SelectorSet();
    var fixture1 = document.getElementById('fixture1');

    var results = set.queryAll(fixture1);
    ok(fixture1);
    equal(results.length, 0);
  });

  test('id', function() {
    var set = new SelectorSet();
    set.add('#foo');

    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('#foo');
    var results = set.queryAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');
    equal(results[0].elements[0], el);
  });

  test('class', function() {
    var set = new SelectorSet();
    set.add('.foo');

    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('.foo');
    var results = set.queryAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, '.foo');
    equal(results[0].elements[0], el);
  });

  test('tag', function() {
    var set = new SelectorSet();
    set.add('foo');

    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('foo');
    var results = set.queryAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, 'foo');
    equal(results[0].elements[0], el);
  });

  test('id and class', function() {
    var set = new SelectorSet();
    set.add('#foo');
    set.add('.foo');

    var fixture1 = document.getElementById('fixture1');
    var el1 = fixture1.querySelector('#foo');
    var el2 = fixture1.querySelector('.foo');
    var results = set.queryAll(fixture1);
    equal(results.length, 2);
    equal(results[0].selector, '#foo');
    equal(results[0].elements[0], el1);
    equal(results[1].selector, '.foo');
    equal(results[1].elements[0], el2);
  });

  test('compound id and class match', function() {
    var set = new SelectorSet();
    set.add('.foo, .bar');
    set.add('#foo, #bar');
    set.add('#foo, .foo');
    set.add('#bar, .bar');

    var fixture1 = document.getElementById('fixture1');
    var el1 = fixture1.querySelector('#foo');
    var el2 = fixture1.querySelector('.foo');
    var results = set.queryAll(fixture1);
    equal(results.length, 3);
    equal(results[0].selector, '.foo, .bar');
    equal(results[0].elements.length, 1);
    equal(results[0].elements[0], el2);
    equal(results[1].selector, '#foo, #bar');
    equal(results[1].elements.length, 1);
    equal(results[1].elements[0], el1);
    equal(results[2].selector, '#foo, .foo');
    equal(results[2].elements.length, 2);
    equal(results[2].elements[0], el1);
    equal(results[2].elements[1], el2);
  });

  test('svg', function() {
    var set = new SelectorSet();
    set.add('svg');
    set.add('.dot');

    var fixture = document.getElementById('fixture-svg');
    var svg = fixture.querySelector('svg');
    var circle = fixture.querySelector('circle');

    var results = set.queryAll(fixture);
    equal(results.length, 2);
    equal(results[0].selector, 'svg');
    equal(results[0].elements.length, 1);
    equal(results[0].elements[0], svg);
    equal(results[1].selector, '.dot');
    equal(results[1].elements.length, 1);
    equal(results[1].elements[0], circle);
  });
})();
