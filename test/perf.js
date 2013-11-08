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

  function graph() {
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

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });


    var svg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');



    color.domain(['indexed', 'linear']);

    x.domain([
      d3.min(data, function(a) { return d3.min(a.values, function(d) { return d[0]; }); }),
      d3.max(data, function(a) { return d3.max(a.values, function(d) { return d[0]; }); })
    ]);

    y.domain([
      d3.min(data, function(a) { return d3.min(a.values, function(d) { return d[1]; }); }),
      d3.max(data, function(a) { return d3.max(a.values, function(d) { return d[1]; }); })
    ]);

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

    var algorithm = svg.selectAll('.algorithm')
        .data(data)
      .enter().append('g')
        .attr('class', 'algorithm');

    algorithm.append('path')
      .attr('class', 'line')
      .attr('d', function(d) { return line(d.values); })
      .style('stroke', function(d) { return color(d.name); });
  }

  window.perf = {graph:graph};
})();
