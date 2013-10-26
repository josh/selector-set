"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        camelcase: true,
        eqeqeq: true,
        indent: 2,
        strict: true,
        trailing: true,
        boss: true,
        browser: true,
        node: true
      },
      files: ['Gruntfile.js', 'selector-set.js'],
      tests: {
        options: {
          devel: true,
          globals: {
            SelectorSet: true,
            QUnit: true,
            module: true,
            test: true,
            asyncTest: true,
            expect: true,
            start: true,
            stop: true,
            ok: true,
            equal: true,
            notEqual: true,
            deepEqual: true,
            notDeepEqual: true,
            strictEqual: true,
            notStrictEqual: true
          }
        },
        files: {
          src: ['test/*.js']
        }
      }
    },
    qunit: {
      all: ['test/index.html']
    },
    watch: {
      files: ['<%= jshint.files %>', 'test/*'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('default', ['jshint']);

};
