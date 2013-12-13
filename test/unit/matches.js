(function() {
  'use strict';

  module('matches');

  test('undefined', function() {
    var set = new SelectorSet();
    var results = set.matches(null);
    equal(results.length, 0);
  });

  test('add/remove', function() {
    var set = new SelectorSet();
    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('#foo');
    ok(el);

    set.add('#foo');
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');

    set.remove('#foo');
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('add/remove multiple', function() {
    var set = new SelectorSet();
    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('#foo');
    ok(el);

    set.add('#foo');
    set.add('#foo');
    var results = set.matches(el);
    equal(results.length, 2);
    equal(results[0].selector, '#foo');
    equal(results[1].selector, '#foo');

    set.remove('#foo');
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('add/remove multiple indexed', function() {
    var set = new SelectorSet();
    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('#foo');
    ok(el);

    set.add('#foo, #bar, .baz');
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#foo, #bar, .baz');

    set.remove('#foo, #bar, .baz');
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('add/remove data', function() {
    var set = new SelectorSet();
    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('#foo');
    ok(el);

    set.add('#foo', 123);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');

    set.remove('#foo', 456);
    results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');

    set.remove('#foo', 123);
    results = set.matches(el);
    equal(results.length, 0);
  });

  test('id', function() {
    var set = new SelectorSet();
    set.add('#foo');
    set.add('#bar');
    set.add('#baz');

    var fixture1 = document.getElementById('fixture1');
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

  test('id as attribute', function() {
    var set = new SelectorSet();
    set.add('[id=foo]');
    set.add('#foo');

    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('[id=foo]');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 2);
    equal(results[0].selector, '[id=foo]');
    equal(results[1].selector, '#foo');
  });

  test('id with tag', function() {
    var set = new SelectorSet();
    set.add('div#foo');
    set.add('span#foo');
    set.add('div#bar');

    var fixture1 = document.getElementById('fixture1');
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

    var fixture1 = document.getElementById('fixture1');
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

  test('class as attribute', function() {
    var set = new SelectorSet();
    set.add('[class=foo]');
    set.add('.foo');

    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('[class=foo]');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 2);
    equal(results[0].selector, '[class=foo]');
    equal(results[1].selector, '.foo');
  });

  test('class with tag', function() {
    var set = new SelectorSet();
    set.add('div.foo');
    set.add('span.foo');
    set.add('div.bar');

    var fixture1 = document.getElementById('fixture1');
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

    var fixture1 = document.getElementById('fixture1');
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

    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('[foo=bar]');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '[foo=bar]');
  });

  test('attribute with "#bar" as value', function() {
    var set = new SelectorSet();
    set.add('[foo="#bar"]');

    var fixture2 = document.getElementById('fixture2');
    var el = fixture2.querySelector('[foo="#bar"]');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '[foo="#bar"]');
  });

  test('attribute with ".bar" as value', function() {
    var set = new SelectorSet();
    set.add('[foo=".bar"]');

    var fixture2 = document.getElementById('fixture2');
    var el = fixture2.querySelector('[foo=".bar"]');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '[foo=".bar"]');
  });

  test('universal', function() {
    var set = new SelectorSet();
    set.add('*');

    var fixture1 = document.getElementById('fixture1');
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

    var fixture1 = document.getElementById('fixture1');
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

    var fixture2 = document.getElementById('fixture2');
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

    var fixture2 = document.getElementById('fixture2');
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

    var fixture2 = document.getElementById('fixture2');
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

    var fixture2 = document.getElementById('fixture2');
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

    var fixture2 = document.getElementById('fixture2');
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

    var fixture1 = document.getElementById('fixture1');
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

    var fixture1 = document.getElementById('fixture1');
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

  test('svg', function() {
    var set = new SelectorSet();
    set.add('svg');
    set.add('.dot');

    var fixture = document.getElementById('fixture-svg');
    var svg = fixture.querySelector('svg');
    var circle = fixture.querySelector('circle');

    var results = set.matches(svg);
    equal(results.length, 1);
    equal(results[0].selector, 'svg');

    results = set.matches(circle);
    equal(results.length, 1);
    equal(results[0].selector, '.dot');
  });

  test('large number of selectors', function() {
    var set = new SelectorSet();

    set.add('#foo');

    var n = 1000;
    while (n--) {
      set.add('#a'+Math.floor(Math.random()*1000000000));
      set.add('.b'+Math.floor(Math.random()*1000000000));
    }

    var fixture1 = document.getElementById('fixture1');
    var el = fixture1.querySelector('#foo');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#foo');
  });

  test('object property names', function() {
    var set = new SelectorSet();
    set.add('#prototype');
    set.add('#constructor');
    set.add('.hasOwnProperty');
    set.add('.isPrototype');
    set.add('.toString');

    var fixture = document.getElementById('fixture-props');
    var el = fixture.querySelector('#prototype');
    ok(el);
    var results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#prototype');

    el = fixture.querySelector('#constructor');
    ok(el);
    results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '#constructor');

    el = fixture.querySelector('.hasOwnProperty');
    ok(el);
    results = set.matches(el);
    equal(results.length, 1);
    equal(results[0].selector, '.hasOwnProperty');
  });
})();
