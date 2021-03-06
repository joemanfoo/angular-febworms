var _ = require('lodash');
var fs = require('fs');

module.exports = function(grunt, projectFiles) {

  var target = grunt.option('target');

  if (target === 'common') {
    throw Error("Don't play smart with me: 'common' is not a valid target to build");
  }

  function getIncludes(ext, sections, cwd, prefix) {
    sections = sections || ['vendor', 'febworms', 'app'];
    cwd = cwd || 'dist';

    if (prefix) {
      if (_.isBoolean(prefix)) {
        prefix = cwd;
      }

      if (prefix[prefix.length - 1] !== '/') prefix += '/';
    }

    var globs = [];

    _.forEach(sections, function(section) {
      globs = globs.concat(projectFiles[section][ext]);
    });

    var results = grunt.file.expand({
      cwd: cwd
    }, globs);

    if (prefix) {
      results = _.map(results, function(val) {
        return prefix + val;
      });
    }

    return results;
  }

  function buildConcatTask(globs, cwd, dest, addGlobs) {
    return {
      src: (function() {

        // Shama made me do this :(
        // https://github.com/gruntjs/grunt-contrib-concat/issues/31

        // var globs = commonConfig.files['febworms'].js;
        var result = grunt.file.expand({
          cwd: cwd
        }, globs).map(function(glob) {
          return cwd + '/' + glob;
        });

        if (addGlobs) {
          result = result.concat(addGlobs);
        }

        return result;

      })(),
      dest: 'package/' + dest
    };
  };

  var gruntConfig = {
    concat: {
      buildTask: buildConcatTask
    },
    files: projectFiles,
    clean: {
      render: ['dist/index.html', 'karma/karma.conf.js'],
      febworms: ['dist/febworms'],
      tmp: ['tmp'],
      app: ['dist/app'],
      vendor: ['dist/vendor'],
      postBuild: {
        src: ['dist/**/*'],
        filter: function(filepath) {
          // Removes only empty folders
          return grunt.file.isDir(filepath) && fs.readdirSync(filepath).length === 0;
        }
      }
    },
    render: {
      index: {
        options: {
          helpers: {
            getIncludes: getIncludes,
            target: target
          }
        },
        files: {
          'dist/index.html': ['src/index.ejs']
        }
      },
      karmaConf: {
        options: {
          helpers: {
            getIncludes: getIncludes,
            target: target
          }
        },
        files: {
          'karma/karma.conf.js': ['karma/karma.conf.ejs']
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma/karma.conf.js'
      },
      single: {
        singleRun: true,
        configFile: 'karma/karma.conf.js'
      }
    }
  };

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-ejs-render');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('ejs', ['clean:render', 'render:index']);
  grunt.registerTask('test-single', ['render:karmaConf', 'karma:single']);
  grunt.registerTask('test', ['build', 'render:karmaConf', 'karma:unit']);

  return gruntConfig;
};
