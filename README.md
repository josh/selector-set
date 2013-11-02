# SelectorSet

## Usage

``` javascript
var set = new SelectorSet();
set.add('#logo');
set.add('.post');
set.add('h1');

set.matches(el);
// => [ { selector: '.post' } ]
```


## Installation

Available on [Bower](http://bower.io) as **selector-set**.

```
$ bower install selector-set
```

Alternatively you can download the single `selector-set.js` file.

```
$ curl -O https://raw.github.com/josh/selector-set/master/selector-set.js
```


## Use cases

### Match delegated events

``` javascript
handlers = new SelectorSet();
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
styles = new SelectorSet();
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


## Implementation

The grouping technique isn't a new idea. In fact, it's how WebKit and Firefox work already. In order to calculate the styles of a single element, a huge number of CSS rules need to be considered.

Check out WebKit's definition of [`RuleSet::findBestRuleSetAndAdd`](https://github.com/WebKit/webkit/blob/c0885665302c752230987427d4021b6df634087d/Source/WebCore/css/RuleSet.cpp#L180-L231) to see how it groups CSS rules by selector category.

In the future I hope something like WebKit's `RuleSet` could be made directly available to the browser.
