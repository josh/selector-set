module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        es3: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        quotmark: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      grunt: {
        src: ['Gruntfile.js'],
        options: {
          node: true
        }
      },
      src: {
        src: ['selector-set.js'],
        options: {
          globals: {
            'define': false
          }
        }
      },
      test: {
        options: {
          globals: {
            'SelectorSet': false,
            'module': false,
            'test': false,
            'ok': false,
            'equal': false
          }
        },
        src: ['test/unit/*.js']
      },
      perf: {
        options: {
          globals: {
            'Benchmark': false,
            'd3': false,
            'SelectorSet': false,
            'ExemplarSelectorSet': false
          }
        },
        src: ['test/perf.js']
      }
    },
    qunit: {
      all: ['test/test*.html']
    },
    watch: {
      grunt: {
        files: ['<%= jshint.grunt.src %>'],
        tasks: ['jshint:grunt']
      },
      src: {
        files: ['<%= jshint.src.src %>'],
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: ['<%= jshint.test.src %>', 'test/*.html'],
        tasks: ['jshint:test', 'qunit']
      },
      perf: {
        files: ['<%= jshint.perf.src %>', 'perf/*.html'],
        tasks: ['jshint:perf']
      }
    }
  });

  grunt.registerTask('benchmark', 'Run benchmarks.', function() {
    var phantomjs = require('grunt-lib-phantomjs').init(grunt);

    phantomjs.on('benchmark.cycle', function(bench) {
      // grunt.log.subhead(bench.name);
      grunt.log.writeln(bench.stats.mean * 1000 * 1000);
    });

    phantomjs.on('benchmark.complete', function() {
      phantomjs.halt();
    });

    var done = this.async();
    phantomjs.spawn('test/benchmark.html', {
      options: {
        timeout: 5000
      },
      done: function(err) {
        done(err);
      }
    });
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('default', ['jshint']);

};
