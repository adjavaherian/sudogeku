module.exports = function(grunt) {

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configurable paths
    var config = {
        app: './app',
        dist: './dist'
    };


    // Project configuration.
    grunt.initConfig({

        config: config,

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static(config.app)
                        ];
                    }
                }
            }
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['<%= config.app %>/styles/{,*/}*.scss'],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= config.app %>/images/{,*/}*'
                ]
            }
        },

        // Automatically inject Bower components into the HTML file
        wiredep: {
            app: {
                ignorePath: new RegExp('^<%= config.app %>/|../'),
                src: ['<%= config.app %>/index.html'],
                exclude: ['bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js']
            },
            sass: {
                src: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                ignorePath: /(\.\.\/){1,2}bower_components\//
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: '<%= config.app %>/index.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
            },
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css']
        },

        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'app/styles/main.css': 'app/styles/main.scss'
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dev: {
                src: [
                    "bower_components/underscore/underscore.js",
                    "bower_components/modernizr/modernizr.js",
                    "bower_components/jquery/dist/jquery.js",
                    "bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/tooltip.js",
                    "bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/*.js",
                    "app/scripts/*.js",
                    "!app/scripts/bundle.js"
                ],
                dest: 'app/scripts/bundle.js'
            }
        }
    });

    grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {

        grunt.task.run([
            'sass',
            'concat',
            'wiredep',
            'useminPrepare',
            'usemin',
            'connect:livereload',
            'watch'
        ]);
    });

};