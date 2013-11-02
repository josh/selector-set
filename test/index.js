testModule('index', function(SelectorSet) {
  'use strict';

  test('ignores non string selector', function() {
    var set = new SelectorSet();
    set.add();
    set.add({});
    set.add(1);
    ok(true);
  });
});
