// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = function(grunt) {
  // Load the grunt related dev deps listed in package.json.
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Load our custom tasks.
  grunt.loadTasks('./build/tasks/');

  var browsers = grunt.option('browsers');
  if (browsers) {
    browsers = browsers.split(/\s*,\s*/g);
  } else {
    browsers = ['PhantomJS'];
  }

  grunt.initConfig({
    clean: {
      all: ['tmp', 'dist']
    },

    make_dir_module: {
      wash: {
        strip: 2,
        dest: 'lib/wash/exe_modules.js',
        cwd: 'lib',
        modules: ['wash/exe/*.js']
      }
    },

    make_main_module: {
      test: {
        require: '__axiomRequire__',
        dest: 'tmp/test/test_main.js',
        cwd: 'lib/',
        modules: ['**/*.test.js']
      }
    },

    closure_externs: {
      build: {
        expand: true,
        src: ['**/*.js'],
        dest: 'tmp/third_party/dcodeIO/',
        cwd: 'third_party/dcodeIO/',
      }
    },

    concat: {
      axiom_base: {
        src: ['loader/axiom_amd.js',
              'tmp/amd/lib/axiom/**/*.js',
              '!tmp/amd/lib/axiom/fs/node/*.js',
              '!tmp/amd/lib/axiom/**/*.test.js'],
        dest: 'dist/axiom_base/amd/lib/axiom_base.amd.concat.js'
      },
      wash: {
        src: ['tmp/amd/lib/wash/**/*.js',
              '!tmp/amd/lib/wash/**/*.test.js'],
        dest: 'dist/axiom_wash/amd/lib/wash.amd.concat.js'
      }
    },

    copy: {
      samples_web_shell_files: {
        files: [{
          expand: true,
          cwd: 'dist/axiom_base/amd/lib/',
          src: ['*.js', '*.map'],
          dest: 'tmp/samples/web_shell/js/'
        },
        {
          expand: true,
          cwd: 'dist/axiom_wash/amd/lib/',
          src: ['*.js'],
          dest: 'tmp/samples/web_shell/js/'
        },
        {
          expand: true,
          cwd: 'node_modules/hterm/dist/amd/lib/',
          src: ['hterm.amd.js'],
          dest: 'tmp/samples/web_shell/js/'
        },
        {
          expand: true,
          cwd: 'samples/web_shell/boot/',
          src: ['**/*.js',
                '**/*.js.map'
          ],
          dest: 'tmp/samples/web_shell/js/boot'
        },
        {
          expand: true,
          cwd: 'samples/web_shell/css/',
          src: ['**/*.css'],
          dest: 'tmp/samples/web_shell/css'
        }]
      },
      samples_use_globals_files: {
        files: [{
          expand: true,
          cwd: 'tmp/dist/',
          src: ['**/*.js'],
          dest: 'tmp/samples/use_globals/js/'
        },
        {
          expand: true,
          cwd: 'samples/use_globals/css/',
          src: ['**/*.css'],
          dest: 'tmp/samples/use_globals/css'
        },
        {
          expand: true,
          cwd: 'samples/use_globals/',
          src: ['**/*.html'],
          dest: 'tmp/samples/use_globals/'
        }]
      }
    },

    make_html_index: {
      samples_web_shell: {
        dest: 'tmp/samples/web_shell/index.html',
        title: 'Console',
        cwd: 'tmp/samples/web_shell/',
        scriptrefs: [
          'js/axiom_base.amd.concat.js',
          'js/wash.amd.concat.js',
          'js/*.js',
          'js/shell/**/*.js',
          'js/boot/startup.js' // last entry since we are synchronous (for now)
        ],
        cssrefs: [
          'css/**/*.css'
        ]
      }
    },

    es6_transpile: {
      samples_web_shell: {
        type: "amd",
        fileResolver: ['lib/',
                       'node_modules/hterm/dist/stub/',
                       'samples/web_shell/lib'],
        files: [{
          expand: true,
          cwd: 'samples/web_shell/lib/',
          src: ['**/*.js'],
          dest: 'tmp/samples/web_shell/js/'
        }]
      }
    },
  });

  // Sample apps
  grunt.registerTask('samples_use_globals', ['copy:samples_use_globals_files']);

  grunt.registerTask('samples_web_shell', ['copy:samples_web_shell_files',
                                         'make_html_index:samples_web_shell']);

  grunt.registerTask('samples', ['samples_web_shell',
                                 'samples_use_globals']);

  grunt.registerTask('deploy_samples', ['samples', 'git_deploy:samples']);
};
