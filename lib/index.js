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

const _         = require('lodash');
const Maelstrom = require('maelstrom');

// // // // // // // // // // // // // // // // // // // // // // // // // // //

const $plugin = new Maelstrom.Plugin(__filename, 'icons',
{
    /**
     * Return the location of the SVGs wich should be used to create the
     * icon font/sprite.
     */
    src: function($src)
    {
        let $defaultSrc = Maelstrom.config.src.icons + '/*.svg';
        return Maelstrom.utils.extendArgs($src, $defaultSrc);
    },

    /**
     * Return the location of either the fonts or the images output folder.
     */
    dest: function($type)
    {
        if (_.isEmpty($type))
        {
            $type = Maelstrom.config.icons.type;
        }

        return (($type === 'sprite') ?
                Maelstrom.config.dest.images :
                Maelstrom.config.dest.fonts);
    }
});

// -----------------------------------------------------------------------------

/**
 * Create iconfonts from seperate SVG icon files. The names and glyphs of
 * the SVGs are written to a Sass import file.
 */
$plugin.setStream('./streams/font.js');

// -----------------------------------------------------------------------------

/**
 * Create iconfonts or a sprite from seperate SVG icon files.
 */
$plugin.setTask('default',
                [Maelstrom.TASK_WATCH, Maelstrom.TASK_COMPILE],
                function()
{
    var $type = Maelstrom.config.icons.type;

    // force iconfont for now
    $type = 'font';

    return Maelstrom.gulp.src( $plugin.src() )
        .pipe( Maelstrom.stream('plumber') )
        .pipe( $plugin.stream($type) )
        .pipe( Maelstrom.stream('size') )
        .pipe( Maelstrom.gulp.dest($plugin.dest()) );
});

// -----------------------------------------------------------------------------

module.exports = $plugin;
