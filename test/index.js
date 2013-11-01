(function() {
  'use strict';

  module('index');

  test('ignores non string selector', function() {
    var set = new SelectorSet();
    set.add();
    set.add({});
    set.add(1);
    ok(true);
  });
})();
