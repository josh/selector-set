(function() {
  'use strict';

  function runCachedBenchmark() {
    var bench = Benchmark.apply(null, arguments);

    if (sessionStorage.getItem(bench.name)) {
      return JSON.parse(sessionStorage[bench.name]);
    } else {
      bench.run();
      sessionStorage[bench.name] = JSON.stringify(bench.stats);
      return bench.stats;
    }
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


  function benchmarkSelectorSets(n) {
    var sets = generateRandomClassSelectorSets(n);

    var el = document.createElement('div');
    el.className = sets.selectors[0];

    var indexedSet = sets.indexed;
    function runIndexed() {
      indexedSet.matches(el);
    }

    var linearSet = sets.linear;
    function runLinear() {
      linearSet.matches(el);
    }

    return {
      indexed: runCachedBenchmark('SelectorSet('+n+')#matches', runIndexed),
      linear: runCachedBenchmark('SlowSelectorSet('+n+')#matches', runLinear),
    };
  }

  function graph(svg) {
    var n = 10;

    var data = [
      {
        name: 'indexed',
        values: []
      },
      {
        name: 'linear',
        values: []
      }
    ];

    var result;
    while (n--) {
      result = benchmarkSelectorSets(n);
      data[0].values.push([n, result.indexed.mean*1000*1000]);
      data[1].values.push([n, result.linear.mean*1000*1000]);
    }

    var g = svg.append('g')
        .attr('transform', 'translate(100, 20)');

    var xMax = d3.max(data[1].values, function(d) { return d[0]; });
    var yMax = d3.max(data[1].values, function(d) { return d[1]; });

    var x = d3.scale.linear()
      .range([0, 400])
      .domain([0, xMax]);
    var y = d3.scale.linear()
      .range([200, 0])
      .domain([0, yMax]);

    var xAxis = d3.svg.axis().scale(x);
    g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, 200)')
        .call(xAxis);

    var yAxis = d3.svg.axis().scale(y).orient('left');
    g.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });

    g.selectAll().data(data)
      .enter().append('g')
      .append('path')
        .attr('class', function(d) { return 'line ' + d.name; })
        .attr('d', function(d) { return line(d.values); });
  }

  window.perf = {graph:graph};
})();
