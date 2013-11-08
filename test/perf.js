(function() {
  'use strict';

  function CachedBenchmark() {
    var bench = Benchmark.apply(null, arguments);
    bench.run = function run() {
      if (!this._original) {
        var json = sessionStorage.getItem(this.name);
        if (json) {
          var cachedObj = JSON.parse(json);
          for (var propName in cachedObj) {
            this[propName] = cachedObj[propName];
          }
          this.emit('complete');
          return this;
        } else {
          Benchmark.prototype.run.apply(this, arguments);
          sessionStorage.setItem(this.name, JSON.stringify(this));
          return this;
        }
      } else {
        return Benchmark.prototype.run.apply(this, arguments);
      }
    };
    return bench;
  }

  function randomClassSelector() {
    return '.rand' + Math.floor(Math.random() * 1e+10);
  }

  function generateRandomClassSelectors(n) {
    var selectors = [];
    while (n--) {
      selectors.push(randomClassSelector());
    }
    return selectors;
  }

  function generateRandomClassSelectorSets(n) {
    var selectors = generateRandomClassSelectors(n);
    var indexed = new SelectorSet();
    var linear = new SlowSelectorSet();
    for (var i = 0; i < n; i++) {
      indexed.add(selectors[i]);
      linear.add(selectors[i]);
    }
    return { selectors: selectors, indexed: indexed, linear: linear };
  }


  function benchmarkForSelectorSetMatch(algorithm, name, set) {
    var el = document.createElement('div');
    el.className = set.selectors[0];
    function run() { set.matches(el); }
    var bench = new CachedBenchmark(name + '#matches', run);
    bench.selectorCount = set.selectors.length;
    bench.algorithm = algorithm;
    return bench;
  }


  function benchmarkSelectorSets(ns) {
    var suite = new Benchmark.Suite();

    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      var sets = generateRandomClassSelectorSets(n);
      suite.push(benchmarkForSelectorSetMatch('indexed', 'SelectorSet('+n+')', sets.indexed));
      suite.push(benchmarkForSelectorSetMatch('linear', 'SlowSelectorSet('+n+')', sets.linear));
    }

    return suite;
  }


  function graph(root) {
    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    function domain(data, fn) {
      return [
        d3.min(data, function(d) { return d3.min(d, fn); }),
        d3.max(data, function(d) { return d3.max(d, fn); })
      ];
    }

    var color = d3.scale.category10();
    function stroke(d) {
      if (d[0]) {
        return color(d[0].algorithm);
      }
    }

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    function xValue(bench) {
      return bench.selectorCount;
    }
    function yValue(bench) {
      return bench.stats.mean * 1000 * 1000;
    }

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { return x(xValue(d)); })
        .y(function(d) { return y(yValue(d)); });

    var svg = d3.select(root).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    function redraw(data) {
      x.domain(domain(data, xValue));
      y.domain(domain(data, yValue));

      svg.select('.x.axis').remove();
      svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0, ' + height + ')')
          .call(xAxis);

      svg.select('.y.axis').remove();
      svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('ms');

      svg.selectAll('.algorithm').remove();
      var algorithm = svg.selectAll('.algorithm')
          .data(data)
        .enter().append('g')
          .attr('class', 'algorithm');

      algorithm.append('path')
        .attr('class', 'line')
        .attr('d', line)
        .style('stroke', stroke);
    }

    return redraw;
  }

  window.perf = {graph:graph, benchmarkSelectorSets:benchmarkSelectorSets};
})();
