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

const _ = require('underscore');

// // // // // // // // // // // // // // // // // // // // // // // // // // //

module.exports = function()
{
    let $plugin = this.Plugin(__filename, 'icons',
    {
        /**
         * Return the location of the SVGs wich should be used to create the
         * icon font/sprite.
         */
        src: function($src)
        {
            let $defaultSrc = this.maelstrom.config.src.icons + '/*.svg';
            return this.maelstrom.utils.extendArgs($src, $defaultSrc);
        },

        /**
         * Return the location of either the fonts or the images output folder.
         */
        dest: function($type)
        {
            if (_.isEmpty($type))
            {
                $type = this.maelstrom.config.icons.type;
            }

            return (($type === 'sprite') ?
                    this.maelstrom.config.dest.images :
                    this.maelstrom.config.dest.fonts);
        }
    });

    $plugin.readStreams();
    $plugin.readTasks();

    return $plugin;
};
