(function() {
  'use strict';

  function CachedBenchmark() {
    var bench = Benchmark.apply(null, arguments);

    var cacheLoaded = false;
    bench.on('complete', function() {
      sessionStorage.setItem(bench.name, JSON.stringify(bench));
    });

    bench.run = function run() {
      if (!cacheLoaded && !this._original) {
        var json = sessionStorage.getItem(this.name);
        if (json) {
          var cachedObj = JSON.parse(json);
          this.stats = cachedObj.stats;
          this.times = cachedObj.times;
          cacheLoaded = true;
          this.emit('complete');
          return this;
        }
      }

      return Benchmark.prototype.run.apply(this, arguments);
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


  function benchmarkSelectorSets(ns, cycle) {
    var suite = new Benchmark.Suite({
      onCycle: function(event) {
        cycle(event.target);
      }
    });

    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      var sets = generateRandomClassSelectorSets(n);
      suite.push(benchmarkForSelectorSetMatch('indexed', 'SelectorSet('+n+')', sets.indexed));
      suite.push(benchmarkForSelectorSetMatch('linear', 'SlowSelectorSet('+n+')', sets.linear));
    }

    return suite;
  }


  function graph(root) {
    var margin = {top: 10, right: 10, bottom: 20, left: 30},
        width = root.width.baseVal.value - margin.left - margin.right,
        height = root.height.baseVal.value - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    function domain(data, fn) {
      return [
        d3.min(data, function(d) { return d3.min(d.values, fn); }),
        d3.max(data, function(d) { return d3.max(d.values, fn); })
      ];
    }

    var color = d3.scale.category10();
    function stroke(d) {
      return color(d.key);
    }

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var nest = d3.nest()
                 .key(function(d) { return d.algorithm; });

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

    var svg = d3.select(root)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('ms');


    function redraw(suite) {
      var data = nest.entries(suite);

      x.domain(domain(data, xValue));
      svg.select('.x.axis').transition().call(xAxis);

      y.domain(domain(data, yValue));
      svg.select('.y.axis').transition().call(yAxis);

      var l = svg.selectAll('.line')
          .data(data);

      l.enter().append('path')
        .attr('class', 'line')
        .style('stroke', stroke);

      l.exit()
        .remove();

      l.transition()
        .attr('d', function(d) { return line(d.values); });
    }

    return redraw;
  }

  window.perf = {graph:graph, benchmarkSelectorSets:benchmarkSelectorSets};
})();
