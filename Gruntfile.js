module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
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
          globals: {
            'module': false
          }
        }
      },
      src: {
        src: ['selector-set.js']
      },
      test: {
        options: {
          globals: {
            'QUnit': false,
            'testModule': false,
            'module': false,
            'test': false,
            'asyncTest': false,
            'expect': false,
            'start': false,
            'stop': false,
            'ok': false,
            'equal': false,
            'notEqual': false,
            'deepEqual': false,
            'notDeepEqual': false,
            'strictEqual': false,
            'notStrictEqual': false,
            'throws': false
          }
        },
        src: ['test/*.js']
      },
      perf: {
        options: {
          globals: {
            'Benchmark': false,
            'd3': false,
            'SelectorSet': false,
            'SlowSelectorSet': false
          }
        },
        src: ['perf/*.js']
      }
    },
    qunit: {
      all: ['test/index.html']
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

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('default', ['jshint']);

};
