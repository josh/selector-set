(function() {
  "use strict";

  module("querySelectorAll");

  var fixture1 = document.getElementById("fixture1");

  test("id", function() {
    var set = new SelectorSet();
    set.add("#foo");

    var el = fixture1.querySelector("#foo");
    var results = set.querySelectorAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, "#foo");
    equal(results[0].elements[0], el);
  });

  test("class", function() {
    var set = new SelectorSet();
    set.add(".foo");

    var el = fixture1.querySelector(".foo");
    var results = set.querySelectorAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, ".foo");
    equal(results[0].elements[0], el);
  });

  test("tag", function() {
    var set = new SelectorSet();
    set.add("foo");

    var el = fixture1.querySelector("foo");
    var results = set.querySelectorAll(fixture1);
    equal(results.length, 1);
    equal(results[0].selector, "foo");
    equal(results[0].elements[0], el);
  });

  test("id and class", function() {
    var set = new SelectorSet();
    set.add("#foo");
    set.add(".foo");

    var el1 = fixture1.querySelector("#foo");
    var el2 = fixture1.querySelector(".foo");
    var results = set.querySelectorAll(fixture1);
    equal(results.length, 2);
    equal(results[0].selector, "#foo");
    equal(results[0].elements[0], el1);
    equal(results[1].selector, ".foo");
    equal(results[1].elements[0], el2);
  });
})();
