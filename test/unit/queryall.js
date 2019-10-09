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
    set.add('.foo, .foo');
    set.add('#foo, #bar');
    set.add('#foo, .foo');
    set.add('#bar, .bar');
    set.add('[class=foo], #foo');
    set.add('.bar, [id=bar]');

    var fixture1 = document.getElementById('fixture1');
    var el1 = fixture1.querySelector('#foo');
    var el2 = fixture1.querySelector('.foo');
    var results = set.queryAll(fixture1);
    equal(results.length, 5);

    equal(results[0].selector, '.foo, .bar');
    equal(results[0].elements.length, 1);
    equal(results[0].elements[0], el2);

    equal(results[1].selector, '.foo, .foo');
    equal(results[1].elements.length, 1);
    equal(results[0].elements[0], el2);

    equal(results[2].selector, '#foo, #bar');
    equal(results[2].elements.length, 1);
    equal(results[2].elements[0], el1);

    equal(results[3].selector, '#foo, .foo');
    equal(results[3].elements.length, 2);
    equal(results[3].elements[0], el1);
    equal(results[3].elements[1], el2);

    equal(results[4].elements.length, 2);
    equal(results[4].elements[0], el1);
    equal(results[4].elements[1], el2);
  });

  test('compound id and class match same element', function() {
    var set = new SelectorSet();
    set.add('foo, #foo, .foo, [foo=bar]');
    set.add('bar, #bar, .bar, [bar=foo]');
    set.add('foo, div, #foo, [foo]');

    var fixture2 = document.getElementById('fixture2');
    var el1 = fixture2.querySelectorAll('[foo]')[0];
    var el2 = fixture2.querySelectorAll('[foo]')[1];
    var el3 = fixture2.querySelectorAll('[foo]')[2];

    var results = set.queryAll(fixture2);
    equal(results.length, 2);

    equal(results[0].selector, 'foo, #foo, .foo, [foo=bar]');
    equal(results[0].elements.length, 1);
    equal(results[0].elements[0], el1);

    equal(results[1].selector, 'foo, div, #foo, [foo]');
    equal(results[1].elements.length, 3);
    equal(results[1].elements[0], el1);
    equal(results[1].elements[1], el2);
    equal(results[1].elements[2], el3);
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

  test('add/remove data', function() {
    var set = new SelectorSet();
    var fixture1 = document.getElementById('fixture1');

    set.add('#foo', 123);
    var results = set.queryAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');
    equal(results[0].data, 123);

    set.add('#bar', 123);
    results = set.queryAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');
    equal(results[0].data, 123);

    set.add('#foo', 456);
    results = set.queryAll(fixture1);
    equal(results.length, 2);
    equal(results[0].selector, '#foo');
    equal(results[1].selector, '#foo');

    set.remove('#bar', 456);
    results = set.queryAll(fixture1);
    equal(results.length, 2);
    equal(results[0].selector, '#foo');
    equal(results[1].selector, '#foo');

    set.remove('#foo', 456);
    results = set.queryAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');
    equal(results[0].data, 123);

    set.remove('#foo', 123);
    results = set.queryAll(fixture1);
    equal(results.length, 0);
  });
})();
