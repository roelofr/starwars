/* jshint strict: false */
/**
 * Gaan we al naar StarWars.nl
 * Just something stupid
 * @author Roelof Roos <github@roelof.io>
 * @license GPL-3.0
 * @see https://gogs.roelof.io/SirQuack/starwars
 */

module.exports = function(grunt) {

    var banner = {
        header: [
            'Gaan we al naar StarWars.nl',
            'Just something stupid',
        ],
        dev: [
            'DEVELOPMENT BUILD',
            'NOT FOR PRODUCTION!'
        ],
        meta: [
            '@author Roelof Roos <github@roelof.io>',
            '@license GPL-3.0',
            '@see https://gogs.roelof.io/SirQuack/starwars'
        ]
    };

    var constructBanner = function(data) {
        var bnr = [];

        // Add jshint ignore
        bnr.push('// jshint ignore: start');

        // Start license block
        bnr.push('/**!');

        var prefix = ' * ';

        data.forEach(function(v){
            if( !banner[v] ) {
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
                './bower_components/jquery.countdown/dist/jquery.countdown.js',
                './dev/js/*.js'
            ]
        },
        jshint: [
            './Gruntfile.js',
            './dev/js/*.js'
        ],
        less: {
            'assets/style.css': './dev/less/style.less'
        },
        img: [{
            expand: true,
            cwd: 'dev/img/',
            src: ['*.{png,jpg,gif}'],
            dest: 'assets/'
        }],
        watch: {
            js: './dev/js/*.js',
            less: './dev/less/*.less',
            img: './dev/img/*.{png,jpg,gif}'
        },
        clean: [
            './assets/*',
            '!./assets/script.min.js',
            '!./assets/style.css'
        ]
    };

    var Autoprefix = require('less-plugin-autoprefix');
    var mozJpeg = require('imagemin-mozjpeg');
    var imageminJpegRecompress  = require('imagemin-jpeg-recompress');

    var plugins = {
        less: [
            new Autoprefix({
                browsers: ["last 2 versions"]
            })
        ],
        img: [
            new mozJpeg(),
            new imageminJpegRecompress({
                accurate: true,
                progressive: true,
                max: 60
            })
        ]
    };

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
                    preserveComments: 'some',
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
        jshint: {
            files: files.jshint,
            options: {
                jshintrc: './.jshintrc'
            }
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

    // Styling guide enforcement
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // JS compilation
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // CSS compilation
    grunt.loadNpmTasks('grunt-contrib-less');

    // Image stuff
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    // Cleaning up
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Live server functionality
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Start registering tasks
    grunt.registerTask('test', ['test-js', 'test-css']);

    grunt.registerTask('test-js', ['jshint']);
    grunt.registerTask('test-css', ['less:dev']);

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
