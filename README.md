# SelectorSet

An efficient data structure for matching and querying elements against a large set of CSS selectors.


## Usage

``` javascript
var set = new SelectorSet();
set.add('#logo');
set.add('.post');
set.add('h1');

set.matches(el);
// => [ { selector: '.post' } ]

set.queryAll(document);
// => [ { selector: '.post': elements: [post] }]
```


## Installation

Available on [Bower](http://bower.io) as **selector-set**.

```
$ bower install selector-set
```

Alternatively you can download the single `selector-set.js` file. There are no additional dependencies.

```
$ curl -O https://raw.github.com/josh/selector-set/master/selector-set.js
```


## Use cases

### Batch find calls

``` javascript
var set = new SelectorSet();
set.add('form.signup', function(form) {
  // ...
});
set.add('#sidebar', function(sidebar) {
  // ...
});
set.add('.menu', function(menu) {
  // ...
});

$ ->
  set.queryAll(document).forEach(function(match) {
    match.elements.forEach(function(el) {
      match.data.call(el, el);
    });
  });
```


### Match delegated events

``` javascript
var handlers = new SelectorSet();
handlers.add('.menu', function(event) {
  // ...
})
handlers.add('.modal', function(event) {
  // ...
})

document.addEventListener('click', function(event) {
  handlers.matches(event.target).forEach(function(rule) {
    rule.data.call(event.target, event);
  });
}, false);
```


### Apply CSS rules

``` javascript
var styles = new SelectorSet();
styles.add('p', {
  fontSize: '12px',
  color: 'red'
});
styles.add('p.item', {
  background: 'white'
});

// apply matching styles
styles.matches(el).forEach(function(rule) {
  for (name in rule.data)
    el.style[name] = rule.data[name];
});
```

Naive at best, but you get the idea. Also see [absurd.js](https://github.com/krasimir/absurd).


## Browser Support

Chrome (latest), Safari (6.0+), Firefox (latest) and IE 9+.

The main requirement is `querySelectorAll` and some sort of `prefixMatchesSelector` support. You can support older browser versions by supplying you own fallback versions of these functions.

``` javascript
// Use Sizzle's match and query functions
SelectorSet.queryAll = Sizzle;
SelectorSet.matches = Sizzle.matchesSelector

// Or use jQuery's internal Sizzle
SelectorSet.queryAll = jQuery.find;
SelectorSet.matches = jQuery.find.matchesSelector
```


## Development

Clone the repository from GitHub.

```
$ git clone https://github.com/josh/selector-set
```

You'll need to have [Grunt](http://gruntjs.com) installed. If you don't have the `grunt` executable available, you can install it with:

```
$ npm install -g grunt-cli
```

Now just `cd` into the directory and install the local npm dependencies.

```
$ cd selector-set/
$ npm install
```

Use `grunt test` to run the test suite.

```
$ grunt test
Running "jshint:all" (jshint) task
>> 5 files lint free.

Running "qunit:all" (qunit) task
Testing test/index.html .....................OK
>> 100 assertions passed (50ms)

Done, without errors.
```


## Implementation

The grouping technique isn't a new idea. In fact, it's how WebKit and Firefox work already. In order to calculate the styles of a single element, a huge number of CSS rules need to be considered.

Check out WebKit's definition of [`RuleSet::findBestRuleSetAndAdd`](https://github.com/WebKit/webkit/blob/c0885665302c752230987427d4021b6df634087d/Source/WebCore/css/RuleSet.cpp#L180-L231) to see how it groups CSS rules by selector category.

In the future I hope something like WebKit's `RuleSet` could be made directly available to the browser.


### Custom indexes

Currently, only first class attributes like `id`, `class` and the tag name are indexed. But if you have some sort of application specific attribute you frequently use, you can write your own custom index on the attribute.

``` javascript
SelectorSet.indexes.push({
  name: 'data-behavior~=',
  selector: function(sel) {
    var m;
    if (m = sel.match(/\[data-behaviors~=(\w+)\]/)) {
      return m[1];
    }
  },
  element: function(el) {
    var behaviors = el.getAttribute('data-behavior');
    if (behaviors) {
      return behaviors.split(/\s+/);
    }
  }
});
```
