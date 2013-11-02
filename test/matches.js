(function() {
  'use strict';

  module('matches');

  var fixture1 = document.getElementById('fixture1');
  var fixture2 = document.getElementById('fixture2');

  test('id', function() {
    var set = new SelectorSet();
    set.add('#foo');
    set.add('#bar');
    set.add('#baz');

    var el = fixture1.querySelector('#foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');

    el = fixture1.querySelector('.foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('id with tag', function() {
    var set = new SelectorSet();
    set.add('div#foo');
    set.add('span#foo');
    set.add('div#bar');

    var el = fixture1.querySelector('div#foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, 'div#foo');

    el = fixture1.querySelector('div.foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('class', function() {
    var set = new SelectorSet();
    set.add('.foo');
    set.add('.bar');
    set.add('.baz');

    var el = fixture1.querySelector('.foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '.foo');

    el = fixture1.querySelector('#foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('class with tag', function() {
    var set = new SelectorSet();
    set.add('div.foo');
    set.add('span.foo');
    set.add('div.bar');

    var el = fixture1.querySelector('div.foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, 'div.foo');

    el = fixture1.querySelector('div#foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('tag', function() {
    var set = new SelectorSet();
    set.add('foo');
    set.add('bar');
    set.add('baz');

    var el = fixture1.querySelector('foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, 'foo');

    el = fixture1.querySelector('div');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('attribute', function() {
    var set = new SelectorSet();
    set.add('[foo=bar]');
    set.add('[foo=baz]');

    var el = fixture1.querySelector('[foo=bar]');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '[foo=bar]');
  });

  test('universal', function() {
    var set = new SelectorSet();
    set.add('*');

    var el = fixture1.querySelector('*');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '*');
  });

  test('id and class', function() {
    var set = new SelectorSet();
    set.add('#foo');
    set.add('#bar');
    set.add('.foo');
    set.add('.bar');

    var el = fixture1.querySelector('#foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');

    el = fixture1.querySelector('.foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '.foo');

    el = fixture1.querySelector('foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('multiple id and class match', function() {
    var set = new SelectorSet();
    set.add('#foo');
    set.add('#bar');
    set.add('.foo');
    set.add('.bar');

    var el = fixture2.querySelector('foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 2);
    equal(results[0].selector, '#foo');
    equal(results[1].selector, '.foo');
  });

  test('multiple id and class match reverse', function() {
    var set = new SelectorSet();
    set.add('.foo');
    set.add('.bar');
    set.add('#foo');
    set.add('#bar');

    var el = fixture2.querySelector('foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 2);
    equal(results[0].selector, '.foo');
    equal(results[1].selector, '#foo');
  });

  test('compound id and class match', function() {
    var set = new SelectorSet();
    set.add('.foo, .bar');
    set.add('#foo, #bar');
    set.add('#foo, .foo');
    set.add('#bar, .bar');

    var el = fixture2.querySelector('foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 3);
    equal(results[0].selector, '.foo, .bar');
    equal(results[1].selector, '#foo, #bar');
    equal(results[2].selector, '#foo, .foo');
  });

  test('multiple id, class and tag match', function() {
    var set = new SelectorSet();
    set.add('#foo');
    set.add('#bar');
    set.add('.foo');
    set.add('.bar');
    set.add('foo');
    set.add('bar');

    var el = fixture2.querySelector('foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 3);
    equal(results[0].selector, '#foo');
    equal(results[1].selector, '.foo');
    equal(results[2].selector, 'foo');
  });

  test('multiple id, class and tag match reverse', function() {
    var set = new SelectorSet();
    set.add('foo');
    set.add('bar');
    set.add('.foo');
    set.add('.bar');
    set.add('#foo');
    set.add('#bar');

    var el = fixture2.querySelector('foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 3);
    equal(results[0].selector, 'foo');
    equal(results[1].selector, '.foo');
    equal(results[2].selector, '#foo');
  });

  test('tag with descendant class', function() {
    var set = new SelectorSet();
    set.add('div .foo');
    set.add('span .foo');
    set.add('div .bar');

    var el = fixture1.querySelector('div.foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, 'div .foo');

    el = fixture1.querySelector('#foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('tag with child class', function() {
    var set = new SelectorSet();
    set.add('div > .foo');
    set.add('span > .foo');
    set.add('div > .bar');

    var el = fixture1.querySelector('div.foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, 'div > .foo');

    el = fixture1.querySelector('#foo');
    ok(el);
    results = set.matches(el);
    equal(results.length, 0);
  });
})();
