module.exports = function(grunt) {
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
        sub: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      src: {
        src: ['selector-set.js']
      },
      tests: {
        options: {
          devel: true,
          predef: [
            "SelectorSet",
            "QUnit",
            "module",
            "test",
            "asyncTest",
            "expect",
            "start",
            "stop",
            "ok",
            "equal",
            "notEqual",
            "deepEqual",
            "notDeepEqual",
            "strictEqual",
            "notStrictEqual",
            "throws"
          ]
        },
        src: ['test/*.js']
      }
    },
    qunit: {
      all: ['test/index.html']
    },
    watch: {
      src: {
        files: ['<%= jshint.src.src %>'],
        tasks: ['jshint:src', 'qunit']
      },
      tests: {
        files: ['<%= jshint.tests.src %>', 'test/*.html'],
        tasks: ['jshint:tests', 'qunit']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('default', ['jshint']);

};
