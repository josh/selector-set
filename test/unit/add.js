testModule('add', function(SelectorSet) {
  'use strict';

  test('ignores non string selector', function() {
    var set = new SelectorSet();
    set.add();
    set.add({});
    set.add(1);
    ok(true);
  });

  test('increments size', function() {
    var set = new SelectorSet();
    equal(set.size, 0);

    set.add('#foo');
    equal(set.size, 1);

    set.add('#bar');
    equal(set.size, 2);
  });
});
