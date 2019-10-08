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
          strict: false,
          globals: {
            'define': false,
            'module': false
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
    watch: {
      grunt: {
        files: ['<%= jshint.grunt.src %>'],
        tasks: ['jshint:grunt']
      },
      src: {
        files: ['<%= jshint.src.src %>'],
        tasks: ['jshint:src', 'qunit:all']
      },
      test: {
        files: ['<%= jshint.test.src %>', 'test/*.html'],
        tasks: ['jshint:test', 'qunit:all']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'qunit:all']);
  grunt.registerTask('fuzz', ['jshint:fuzz', 'qunit:fuzz']);
  grunt.registerTask('default', ['jshint']);
};
