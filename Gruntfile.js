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
        src: ['selector-set.js']
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
      fuzz: {
        options: {
          globals: {
            'SelectorSet': false,
            'ExemplarSelectorSet': false,
            'QUnit': false
          }
        },
        src: ['test/fuzz.js']
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
      all: ['test/test-exemplar.html', 'test/test.html'],
      fuzz: ['test/test-fuzz.html']
    },
    connect: {
      server: {
        options: {
          base: '',
          port: 9999
        }
      }
    },
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ['http://127.0.0.1:9999/test/test.html'],
          tunnelTimeout: 5,
          build: process.env.TRAVIS_JOB_ID,
          concurrency: 1,
          browsers: [
            { browserName: 'safari', platform: 'OS X 10.9' },
            { browserName: 'chrome', platform: 'Linux' },
            { browserName: 'firefox', platform: 'Windows 8.1' },
            { browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
            { browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
            { browserName: 'internet explorer', version: '9', platform: 'Windows 7' }
          ]
        }
      }
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

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('test', ['jshint', 'qunit:all']);
  grunt.registerTask('fuzz', ['jshint:fuzz', 'qunit:fuzz']);
  grunt.registerTask('sauce', ['connect', 'saucelabs-qunit']);
  grunt.registerTask('travis', ['jshint', 'sauce']);
  grunt.registerTask('default', ['jshint']);
};
