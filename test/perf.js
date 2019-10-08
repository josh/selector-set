(function() {
  'use strict';

  function each(obj, fn) {
    for (var key in obj) {
      fn(key, obj[key]);
    }
  }

  function defineCachedProperties(obj, props) {
    var properties = {};
    each(props, function(name, fn) {
      var cache;
      properties[name] = {
        get: function() {
          if (!cache) {
            cache = fn.apply(this, arguments);
          }
          return cache;
        }
      };
    });
    Object.defineProperties(obj, properties);
  }

  function random() {
    return Math.floor(Math.random() * 1e10);
  }

  function initSet(Set, selectors) {
    var set = new Set();
    for (var i = 0; i < selectors.length; i++) {
      set.add(selectors[i]);
    }
    return set;
  }

  function createElementMatchingSelector(selector) {
    if (!selector) {
      return;
    }

    var m, el;
    if ((m = selector.match(/^#(\w+)$/))) {
      el = document.createElement('div');
      el.id = m[1];
    } else if ((m = selector.match(/^\.(\w+)$/))) {
      el = document.createElement('div');
      el.className = m[1];
    } else if ((m = selector.match(/^(\w+)$/))) {
      el = document.createElement(m[1]);
    }

    if (!SelectorSet.prototype.matchesSelector(el, selector)) {
      throw 'couldn\'t make element matching "' + selector + '"';
    }

    return el;
  }

  function Bench(props) {
    for (var propName in props) {
      this[propName] = props[propName];
    }
  }

  Bench.prototype.implementations = [SelectorSet, ExemplarSelectorSet];
  Bench.prototype.sizes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25];

  defineCachedProperties(Bench.prototype, {
    selectors: function() {
      var selectors = [];
      var n = 100;
      while (n--) {
        selectors.push(this.randomSelector());
      }
      return selectors;
    },
    sets: function() {
      var i,
        j,
        sets = [];
      for (i = 0; i < this.sizes.length; i++) {
        var selectors = this.selectors.slice(0, this.sizes[i]);
        for (j = 0; j < this.implementations.length; j++) {
          sets.push(initSet(this.implementations[j], selectors));
        }
      }
      return sets;
    },
    element: function() {
      return createElementMatchingSelector(this.selectors[0]);
    },
    tree: function() {
      var root = document.createElement('div');
      root.innerHTML =
        '<div><div><div><div id=parent></div></div></div><div></div></div>';
      root.querySelector('#parent').appendChild(this.element);
      return root;
    },
    suite: function() {
      var i,
        suite = new Benchmark.Suite();
      for (i = 0; i < this.sets.length; i++) {
        var set = this.sets[i];
        var run = this.run(set);
        run.set = set;
        suite.add(run);
      }
      return suite;
    }
  });

  Bench.prototype.runMatch = function(set) {
    var el = this.element;
    return function run() {
      set.matches(el);
    };
  };

  Bench.prototype.runQueryAll = function(set) {
    var root = this.tree;
    return function run() {
      set.queryAll(root);
    };
  };

  var benchmarks = [
    new Bench({
      name: 'match - id',
      randomSelector: function() {
        return '#rand' + random();
      },
      run: Bench.prototype.runMatch
    }),
    new Bench({
      name: 'match - class',
      randomSelector: function() {
        return '.rand' + random();
      },
      run: Bench.prototype.runMatch
    }),
    new Bench({
      name: 'match - tag',
      randomSelector: function() {
        return 'rand' + random();
      },
      run: Bench.prototype.runMatch
    }),
    new Bench({
      name: 'match - id/class',
      randomSelector: function() {
        if (Math.random() < 0.5) {
          return '#rand' + random();
        } else {
          return '.rand' + random();
        }
      },
      run: Bench.prototype.runMatch
    }),
    new Bench({
      name: 'queryAll - id',
      randomSelector: function() {
        return '#rand' + random();
      },
      run: Bench.prototype.runQueryAll
    })
  ];

  function graph(root) {
    var margin = { top: 10, right: 10, bottom: 20, left: 30 },
      width = root.width.baseVal.value - margin.left - margin.right,
      height = root.height.baseVal.value - margin.top - margin.bottom;

    var x = d3.scale.linear().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);

    function domain(data, fn) {
      return [
        d3.min(data, function(d) {
          return d3.min(d.values, fn);
        }),
        d3.max(data, function(d) {
          return d3.max(d.values, fn);
        })
      ];
    }

    var color = d3.scale.category10();
    function stroke(d) {
      return color(d.key);
    }

    var xAxis = d3.svg
      .axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient('left');

    var nest = d3.nest().key(function(d) {
      return d.fn.set.constructor.name;
    });

    function xValue(bench) {
      return bench.fn.set.selectors.length;
    }
    function yValue(bench) {
      return bench.stats.mean * 1000 * 1000;
    }

    var line = d3.svg
      .line()
      .interpolate('basis')
      .x(function(d) {
        return x(xValue(d));
      })
      .y(function(d) {
        return y(yValue(d));
      });

    var svg = d3
      .select(root)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + height + ')')
      .call(xAxis);

    svg
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('μs');

    function redraw(suite) {
      var data = nest.entries(suite);

      x.domain(domain(data, xValue));
      svg
        .select('.x.axis')
        .transition()
        .call(xAxis);

      y.domain(domain(data, yValue));
      svg
        .select('.y.axis')
        .transition()
        .call(yAxis);

      var l = svg.selectAll('.line').data(data);

      l.enter()
        .append('path')
        .attr('class', 'line')
        .style('stroke', stroke);

      l.exit().remove();

      l.transition().attr('d', function(d) {
        return line(d.values);
      });
    }

    return redraw;
  }

  window.perf = {
    benchmarks: benchmarks,
    graph: graph
  };
})();
