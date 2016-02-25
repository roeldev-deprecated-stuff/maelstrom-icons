/**
 * maelstrom-icons | lib/index.js
 *
 * Streams:
 * ✓ font
 * - sprite*
 *
 * Tasks:
 * ✓ icons
 */
'use strict';

const _            = require('lodash');
const GulpIconFont = require('gulp-iconfont');

// // // // // // // // // // // // // // // // // // // // // // // // // // //

module.exports = function()
{
    const Maelstrom = this;
    const Config    = Maelstrom.config;
    const Gulp      = Maelstrom.gulp;
    const Utils     = Maelstrom.utils;

    // -------------------------------------------------------------------------

    let $plugin = new Maelstrom.Plugin(__filename, 'icons',
    {
        /**
         * Return the location of the SVGs wich should be used to create the
         * icon font/sprite.
         */
        src: function($src)
        {
            let $defaultSrc = Config.src.icons + '/*.svg';
            return Utils.extendArgs($src, $defaultSrc);
        },

        /**
         * Return the location of either the fonts or the images output folder.
         */
        dest: function($type)
        {
            if (_.isEmpty($type))
            {
                $type = Config.icons.type;
            }

            return (($type === 'sprite') ?
                    Config.dest.images :
                    Config.dest.fonts);
        }
    });

    // -------------------------------------------------------------------------

    /**
     * Create iconfonts from seperate SVG icon files. The names and glyphs of
     * the SVGs are written to a Sass import file.
     */
    $plugin.addStream('font', function($templateConfig)
    {
        let $config = _.extendOwn({}, Config.icons.iconfont,
        {
            'fontName':       Config.icons.outputName,
            'templateConfig': $templateConfig,
            // 'timestamp':      Math.round(Date.now()/1000),
        });

        let $stream = require('./font')(Maelstrom, $plugin);

        return GulpIconFont($config).on('glyphs', $stream);
    });

    // -------------------------------------------------------------------------

    /**
     * Create iconfonts or a sprite from seperate SVG icon files.
     */
    $plugin.addTask('icons', function()
    {
        var $type = Config.icons.type;

        // force iconfont for now
        $type = 'font';

        return Gulp.src( $plugin.src() )
            .pipe( Maelstrom.stream('plumber') )
            .pipe( $plugin.stream($type) )
            // .pipe( GulpSize(Config.main.size) )
            .pipe( Maelstrom.stream('size') )
            .pipe( Gulp.dest($plugin.dest()) );
    });

    return $plugin;
};
