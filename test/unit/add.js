testModule('add', function(SelectorSet) {
  'use strict';

  test('ignores non string selector', function() {
    var set = new SelectorSet();
    set.add();
    set.remove();
    set.add({});
    set.remove({});
    set.add(1);
    set.remove(1);
    ok(true);
  });

  test('increments size', function() {
    var set = new SelectorSet();
    equal(set.size, 0);

    set.add('#foo');
    equal(set.size, 1);

    set.add('#foo');
    equal(set.size, 2);

    set.add('#bar');
    equal(set.size, 3);

    set.add('#bar', 123);
    equal(set.size, 4);

    set.add('#bar', 456);
    equal(set.size, 5);

    set.remove('#foo');
    equal(set.size, 3);

    set.remove('#bar', undefined);
    equal(set.size, 2);

    set.remove('#bar', 456);
    equal(set.size, 1);

    set.remove('#bar');
    equal(set.size, 0);
  });
});
