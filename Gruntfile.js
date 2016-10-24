/* eslint-env: node */
/* eslint strict: [2, "never"], vars-on-top: 0 */
/**
 * Gaan we al naar StarWars.nl
 * Just something stupid
 * @author Roelof Roos <github@roelof.io>
 * @license AGPL-3.0
 * @see https://github.com/roelofr/starwars
 */

var ImageminMozJpeg = require('imagemin-mozjpeg');
var ImageminJpegRecompress = require('imagemin-jpeg-recompress');
var AutoPrefix = require('less-plugin-autoprefix');
var es6Promise = require('es6-promise');

module.exports = function(grunt) {
    var banner = {
        header: [
            'Gaan we al naar StarWars.nl',
            'Just something stupid'
        ],
        dev: [
            'DEVELOPMENT BUILD',
            'NOT FOR PRODUCTION!'
        ],
        meta: [
            '@author Roelof Roos <github@roelof.io>',
            '@license AGPL-3.0',
            '@see https://github.com/roelofr/starwars'
        ]
    };

    var constructBanner = function(data) {
        var bnr = [];

        // Add jshint ignore
        bnr.push('// jshint ignore: start');

        // Start license block
        bnr.push('/**!');

        var prefix = ' * ';

        data.forEach(function(v) {
            if (!banner[v]) {
                return;
            }

            banner[v].forEach(function(val) {
                bnr.push(prefix + val);
            });
            bnr.push(prefix);
        });
        bnr.pop();

        bnr.push(' */');

        return bnr.join('\n') + '\n';
    };

    var distBanner = constructBanner(['header', 'meta']);
    var devBanner = constructBanner(['header', 'dev', 'meta']);

    var files = {
        js: {
            'assets/script.min.js': [
                'node_modules/jquery-countdown/src/countdown.js',
                'dev/js/*.js'
            ]
        },
        eslint: [
            'Gruntfile.js',
            'dev/js/*.js'
        ],
        lesslint: [
            'dev/less/style.less'
        ],
        less: {
            'assets/style.css': 'dev/less/style.less'
        },
        img: [{
            expand: true,
            cwd: 'dev/img/',
            src: ['*.{png,jpg,gif}'],
            dest: 'assets/'
        }],
        watch: {
            js: 'dev/js/*.js',
            less: 'dev/less/*.less',
            img: 'dev/img/*.{png,jpg,gif}'
        },
        clean: [
            'assets/*',
            '!assets/script.min.js',
            '!assets/style.css'
        ]
    };

    var plugins = {
        less: [
            new AutoPrefix({
                browsers: ["last 2 versions"]
            })
        ],
        img: [
            new ImageminMozJpeg(),
            new ImageminJpegRecompress({
                accurate: true,
                progressive: true,
                max: 60
            })
        ]
    };

    // Load polyfill
    es6Promise.polyfill();

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        banner: {
            prod: distBanner,
            dev: devBanner
        },

        // Start of JS minifier
        uglify: {
            prod: {
                options: {
                    mangle: true,
                    compress: true,
                    ASCIIOnly: false,
                    preserveComments: 0,
                    banner: distBanner,
                    mangleProperties: true,
                    quoteStyle: 1
                },
                files: files.js
            },
            dev: {
                options: {
                    mangle: false,
                    compress: false,
                    ASCIIOnly: false,
                    preserveComments: 'some',
                    banner: devBanner,
                    mangleProperties: false,
                    quoteStyle: 1
                },
                files: files.js
            }
        },

        // JS Linter
        eslint: {
            target: files.eslint,
            options: {
                fix: false
            }
        },

        // Less linting
        lesslint: {
            src: files.lesslint
        },

        // Start of LESS linter and compiler
        less: {
            prod: {
                options: {
                    compress: true,
                    plugins: plugins.less,
                    ieCompat: false,
                    strictMath: true,
                    strictUnits: true,
                    banner: distBanner
                },
                files: files.less
            },
            dev: {
                options: {
                    compress: false,
                    plugins: plugins.less,
                    ieCompat: false,
                    strictMath: true,
                    strictUnits: true,
                    banner: devBanner
                },
                files: files.less
            }
        },

        // Start of image minifier
        imagemin: {
            static: {
                options: {
                    optimizationLevel: 7,
                    use: plugins.img
                },
                files: files.img
            }
        },

        // Start of image minifier
        clean: {
            static: files.clean
        },

        // Watch config
        watch: {
            less: {
                files: files.watch.less,
                tasks: ['dev-css'],
                options: {
                    interrupt: true
                }
            },
            js: {
                files: files.watch.js,
                tasks: ['dev-js'],
                options: {
                    interrupt: true
                }
            },
            imagemin: {
                files: files.watch.img,
                tasks: ['dist-img'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-lesslint');

    // Start registering tasks
    grunt.registerTask('test', ['test-js', 'test-css']);

    grunt.registerTask('test-js', ['eslint']);
    grunt.registerTask('test-css', ['lesslint']);

    grunt.registerTask(
        'dev-js',
        'Prepares javascript assets for testing',
        ['test-js', 'uglify:dev']
    );

    grunt.registerTask(
        'dev-css',
        'Prepares CSS styling for testing',
        ['less:dev']
    );

    grunt.registerTask(
        'prod-js',
        'Prepares javascript assets for deployment',
        ['test-js', 'uglify:prod']
    );

    grunt.registerTask(
        'prod-css',
        'Prepares CSS styling for deployment',
        ['test-css', 'less:prod']
    );

    grunt.registerTask(
        'prod-img',
        'Compresses images for deployment',
        ['imagemin:static']
    );

    grunt.registerTask('default', 'dev');

    grunt.registerTask(
        'dev',
        'Compiles assets for testing',
        [
            'clean', 'dev-js', 'dev-css', 'prod-img'
        ]
    );

    grunt.registerTask(
        'prod',
        'Compiles assets for deployment',
        [
            'clean', 'prod-js', 'prod-css', 'prod-img'
        ]
    );
};
